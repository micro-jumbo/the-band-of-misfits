import {
  Arn,
  ArnFormat,
  aws_iam,
  aws_sns,
  aws_stepfunctions,
  aws_stepfunctions_tasks,
} from "aws-cdk-lib";
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

    const fireState = new aws_stepfunctions_tasks.SnsPublish(
      this,
      "SnsPublish",
      {
        topic: props.topic,
        message: aws_stepfunctions.TaskInput.fromJsonPathAt("$.payload"),
        messageAttributes: {
          type: {
            dataType: aws_stepfunctions_tasks.MessageAttributeDataType.STRING,
            value: aws_stepfunctions.TaskInput.fromJsonPathAt("$.type"),
          },
        },
      },
    );

    waitState.next(fireState);

    this.stateMachine = new aws_stepfunctions.StateMachine(
      this,
      "StateMachine",
      {
        definitionBody:
          aws_stepfunctions.DefinitionBody.fromChainable(waitState),
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
