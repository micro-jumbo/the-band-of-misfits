import {
  aws_kms,
  aws_lambda,
  aws_sns,
  aws_sns_subscriptions,
  aws_sqs,
  Stack,
  StackProps,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import { ApiConstruct } from "../constructs/api";
import { DynamoTable } from "../constructs/dynamo-table";
import { RunTimerStateMachine } from "../constructs/state-machine";

export type Subscriber = aws_sqs.Queue | aws_lambda.Function;

export class ApplicationStack extends Stack {
  private readonly topic: aws_sns.ITopic;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const masterKey = aws_kms.Alias.fromAliasName(
      this,
      "aws-managed-sns-kms-key",
      "alias/aws/sns",
    );

    this.topic = new aws_sns.Topic(this, "Topic", {
      enforceSSL: true,
      masterKey,
    });

    const stateMachine = new RunTimerStateMachine(
      this,
      "JackOfTheCloudMachine",
      {
        topic: this.topic,
      },
    );

    const dynamoTable = new DynamoTable(this, "JackOfTheCloudTable");

    new ApiConstruct(this, "JackOfTheCloudApi", { stateMachine, dynamoTable });

    this.exportValue(this.topic.topicArn, {
      name: `${this.stackName}-topic-arn`,
    });
    this.exportValue(stateMachine.stateMachineArn, {
      name: `${this.stackName}-machine-arn`,
    });
  }

  public addSubscriber(subscriber: Subscriber, filter?: string[]): void {
    const filterPolicy =
      filter && filter.length > 0
        ? {
            type: aws_sns.SubscriptionFilter.stringFilter({
              allowlist: filter,
            }),
          }
        : undefined;
    this.topic.addSubscription(
      this.createSubscription(subscriber, {
        rawMessageDelivery: true,
        filterPolicy,
      }),
    );
  }

  private createSubscription(
    subscriber: Subscriber,
    props: aws_sns_subscriptions.SqsSubscriptionProps,
  ): aws_sns.ITopicSubscription {
    if (subscriber instanceof aws_sqs.Queue) {
      return new aws_sns_subscriptions.SqsSubscription(subscriber, props);
    } else if (subscriber instanceof aws_lambda.Function) {
      return new aws_sns_subscriptions.LambdaSubscription(subscriber, props);
    } else {
      throw new Error("Invalid subscriber");
    }
  }
}
