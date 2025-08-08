import { Authorizers, Integrations } from "@aws/pdk/type-safe-api";
import {
  Api,
  CancelTimerFunction,
  CreateTimerFunction,
  UpdateTimerFunction,
} from "@the-band-of-misfits/jack-in-the-cloud-api-typescript-infra";
import { Stack } from "aws-cdk-lib";
import { Cors } from "aws-cdk-lib/aws-apigateway";
import {
  AccountPrincipal,
  AnyPrincipal,
  Effect,
  PolicyDocument,
  PolicyStatement,
} from "aws-cdk-lib/aws-iam";
import { Architecture, FunctionProps, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { DynamoTable } from "../dynamo-table";
import { RunTimerStateMachine } from "../state-machine";

/**
 * Api construct props.
 */
export interface JackInTheCloudProps {
  readonly stateMachine: RunTimerStateMachine;
  readonly dynamoTable: DynamoTable;
}

/**
 * Infrastructure construct to deploy a Type Safe API.
 */
export class JackInTheCloud extends Construct {
  /**
   * API instance
   */
  public readonly api: Api;

  /**
   * Lambda functions for timer operations
   */
  public readonly createTimerFunction: CreateTimerFunction;
  public readonly cancelTimerFunction: CancelTimerFunction;
  public readonly updateTimerFunction: UpdateTimerFunction;

  constructor(scope: Construct, id: string, props: JackInTheCloudProps) {
    super(scope, id);

    const lambdaProps: Partial<FunctionProps> = {
      architecture: Architecture.ARM_64,
      environment: {
        MACHINE_ARN: props.stateMachine.stateMachineArn,
        TABLE_NAME: props.dynamoTable.tableName,
        POWERTOOLS_SERVICE_NAME: "jack-in-the-cloud",
        POWERTOOLS_METRICS_NAMESPACE: "the-band-of-misfits",
      },
      runtime: Runtime.NODEJS_20_X,
    };

    this.createTimerFunction = new CreateTimerFunction(this, "CreateTimer", {
      ...lambdaProps,
      functionName: "createTimer",
    });
    props.dynamoTable.grantWriteData(this.createTimerFunction);
    props.stateMachine.grantStartExecution(this.createTimerFunction);

    this.cancelTimerFunction = new CancelTimerFunction(this, "CancelTimer", {
      ...lambdaProps,
      functionName: "cancelTimer",
    });
    props.dynamoTable.grantReadData(this.cancelTimerFunction);
    props.dynamoTable.grantWriteData(this.cancelTimerFunction);
    props.stateMachine.grantStopExecution(this.cancelTimerFunction);

    this.updateTimerFunction = new UpdateTimerFunction(this, "UpdateTimer", {
      ...lambdaProps,
      functionName: "updateTimer",
    });
    props.dynamoTable.grantReadData(this.updateTimerFunction);
    props.dynamoTable.grantWriteData(this.updateTimerFunction);
    props.stateMachine.grantStartExecution(this.updateTimerFunction);
    props.stateMachine.grantStopExecution(this.updateTimerFunction);

    this.api = new Api(this, id, {
      webAclOptions: {
        disable: true,
      },
      defaultAuthorizer: Authorizers.iam(),
      corsOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
      },
      integrations: {
        createTimer: {
          integration: Integrations.lambda(this.createTimerFunction),
        },
        cancelTimer: {
          integration: Integrations.lambda(this.cancelTimerFunction),
        },
        updateTimer: {
          integration: Integrations.lambda(this.updateTimerFunction),
        },
      },
      policy: new PolicyDocument({
        statements: [
          // Here we grant any AWS credentials from the account that the prototype is deployed in to call the api.
          // Machine to machine fine-grained access can be defined here using more specific principals (eg roles or
          // users) and resources (ie which api paths may be invoked by which principal) if required.
          // If doing so, the cognito identity pool authenticated role must still be granted access for cognito users to
          // still be granted access to the API.
          new PolicyStatement({
            effect: Effect.ALLOW,
            principals: [new AccountPrincipal(Stack.of(this).account)],
            actions: ["execute-api:Invoke"],
            resources: ["execute-api:/*"],
          }),
          // Open up OPTIONS to allow browsers to make unauthenticated preflight requests
          new PolicyStatement({
            effect: Effect.ALLOW,
            principals: [new AnyPrincipal()],
            actions: ["execute-api:Invoke"],
            resources: ["execute-api:/*/OPTIONS/*"],
          }),
        ],
      }),
    });
  }
}
