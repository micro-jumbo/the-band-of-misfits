import { UserIdentity } from "@aws/pdk/identity";
import { Authorizers, Integrations } from "@aws/pdk/type-safe-api";
import {
  Api,
  CancelTimerFunction,
  CreateTimerFunction,
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
import { RunTimerStateMachine } from "./state-machine";

/**
 * Api construct props.
 */
export interface ApiConstructProps {
  /**
   * Instance of the UserIdentity.
   */
  readonly userIdentity?: UserIdentity;
  readonly stateMachine: RunTimerStateMachine;
}

/**
 * Infrastructure construct to deploy a Type Safe API.
 */
export class ApiConstruct extends Construct {
  /**
   * API instance
   */
  public readonly api: Api;

  constructor(scope: Construct, id: string, props: ApiConstructProps) {
    super(scope, id);

    const lambdaProps: Partial<FunctionProps> = {
      architecture: Architecture.ARM_64,
      environment: {
        JACK_MACHINE_ARN: props.stateMachine.stateMachineArn,
      },
      runtime: Runtime.NODEJS_20_X,
    };

    const createTimerFunction = new CreateTimerFunction(
      this,
      "CreateTimer",
      lambdaProps,
    );
    props.stateMachine.grantStartExecution(createTimerFunction);

    const cancelTimerFunction = new CancelTimerFunction(
      this,
      "CancelTimer",
      lambdaProps,
    );
    props.stateMachine.grantStopExecution(cancelTimerFunction);

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
          integration: Integrations.lambda(createTimerFunction),
        },
        cancelTimer: {
          integration: Integrations.lambda(cancelTimerFunction),
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

    // Grant authenticated users access to invoke the api
    // props?.userIdentity.identityPool.authenticatedRole.addToPrincipalPolicy(
    //   new PolicyStatement({
    //     effect: Effect.ALLOW,
    //     actions: ["execute-api:Invoke"],
    //     resources: [this.api.api.arnForExecuteApi("*", "/*", "*")],
    //   }),
    // );
  }
}
