import path from "path";
import {
  Arn,
  ArnFormat,
  aws_iam,
  aws_lambda_nodejs,
  aws_sns,
  aws_stepfunctions,
  aws_stepfunctions_tasks,
  Duration,
} from "aws-cdk-lib";
import { Architecture, Code, Runtime, Tracing } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

export interface RunTimerStateMachineProps {
  topic: aws_sns.ITopic;
}

export class RunTimerStateMachine extends Construct {
  private readonly stateMachine: aws_stepfunctions.StateMachine;

  constructor(scope: Construct, id: string, props: RunTimerStateMachineProps) {
    super(scope, id);

    const waitState = new aws_stepfunctions.Wait(this, "Wait", {
      time: aws_stepfunctions.WaitTime.timestampPath("$.fireAt"),
    });

    const fireLambda = new aws_lambda_nodejs.NodejsFunction(
      this,
      "FireLambda",
      {
        runtime: Runtime.NODEJS_20_X,
        handler: "index.handler",
        code: Code.fromAsset(
          path.resolve(
            __dirname,
            "../../../api/handlers/typescript/dist/lambda",
            "fire-timer",
          ),
        ),
        tracing: Tracing.ACTIVE,
        timeout: Duration.seconds(30),
        architecture: Architecture.ARM_64,
        environment: {
          TOPIC_ARN: props.topic.topicArn,
          POWERTOOLS_SERVICE_NAME: "jack-in-the-cloud",
          POWERTOOLS_METRICS_NAMESPACE: "the-band-of-misfits",
        },
      },
    );

    props.topic.grantPublish(fireLambda);

    const fireState = new aws_stepfunctions_tasks.LambdaInvoke(
      this,
      "FireState",
      {
        lambdaFunction: fireLambda,
        payload: aws_stepfunctions.TaskInput.fromJsonPathAt("$"),
        // inputPath: "$.input",
        // outputPath: "$.payload",
      },
    );

    // const fireState = new aws_stepfunctions_tasks.SnsPublish(
    //   this,
    //   "SnsPublish",
    //   {
    //     topic: props.topic,
    //     message: aws_stepfunctions.TaskInput.fromJsonPathAt("$.payload"),
    //     messageAttributes: {
    //       type: {
    //         dataType: aws_stepfunctions_tasks.MessageAttributeDataType.STRING,
    //         value: aws_stepfunctions.TaskInput.fromJsonPathAt("$.type"),
    //       },
    //     },
    //   },
    // );

    waitState.next(fireState);

    this.stateMachine = new aws_stepfunctions.StateMachine(
      this,
      "StateMachine",
      {
        definitionBody:
          aws_stepfunctions.DefinitionBody.fromChainable(waitState),
        tracingEnabled: true,
      },
    );
  }

  get stateMachineArn(): string {
    return this.stateMachine.stateMachineArn;
  }

  public grantStartExecution(grantee: aws_iam.IGrantable): void {
    this.stateMachine.grantStartExecution(grantee);
  }

  public grantStopExecution(grantee: aws_iam.IGrantable): void {
    const machineArn = Arn.split(
      this.stateMachine.stateMachineArn,
      ArnFormat.COLON_RESOURCE_NAME,
    );
    const executionArnPrefix = Arn.format({
      ...machineArn,
      resource: "execution",
    });
    grantee.grantPrincipal.addToPrincipalPolicy(
      new aws_iam.PolicyStatement({
        actions: ["states:StopExecution"],
        resources: [`${executionArnPrefix}:*`],
      }),
    );
  }
}
