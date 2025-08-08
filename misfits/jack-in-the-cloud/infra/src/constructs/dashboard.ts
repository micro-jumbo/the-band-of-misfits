import { TypeSafeRestApi } from "@aws/pdk/type-safe-api";
import {
  aws_cloudwatch,
  aws_dynamodb,
  aws_lambda,
  aws_sns,
  aws_stepfunctions,
  Duration,
} from "aws-cdk-lib";
import { Construct } from "constructs";

export interface JackInTheCloudDashboardProps {
  api: TypeSafeRestApi;
  dynamoTable: aws_dynamodb.Table;
  topic: aws_sns.ITopic;
  stateMachine: aws_stepfunctions.StateMachine;
  createTimerFunction: aws_lambda.Function;
  fireTimerFunction: aws_lambda.Function;
  cancelTimerFunction: aws_lambda.Function;
  updateTimerFunction: aws_lambda.Function;
}

export class JackInTheCloudDashboard extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: JackInTheCloudDashboardProps,
  ) {
    super(scope, id);

    const dashboard = new aws_cloudwatch.Dashboard(this, "Dashboard", {
      dashboardName: "The-Band-of-Misfits----Jack-In-The-Cloud",
    });

    // API Gateway metrics
    const apiWidget = new aws_cloudwatch.GraphWidget({
      title: "API Gateway",
      left: [
        new aws_cloudwatch.Metric({
          namespace: "AWS/ApiGateway",
          metricName: "Count",
          dimensionsMap: {
            ApiName: props.api.api.restApiId,
          },
          period: Duration.minutes(1),
          statistic: "Sum",
          label: "Request Count",
        }),
        new aws_cloudwatch.Metric({
          namespace: "AWS/ApiGateway",
          metricName: "Latency",
          dimensionsMap: {
            ApiName: props.api.api.restApiId,
          },
          period: Duration.minutes(1),
          statistic: "Average",
          label: "Latency",
        }),
        new aws_cloudwatch.Metric({
          namespace: "AWS/ApiGateway",
          metricName: "4XXError",
          dimensionsMap: {
            ApiName: props.api.api.restApiId,
          },
          period: Duration.minutes(1),
          statistic: "Sum",
          label: "4XX Errors",
        }),
        new aws_cloudwatch.Metric({
          namespace: "AWS/ApiGateway",
          metricName: "5XXError",
          dimensionsMap: {
            ApiName: props.api.api.restApiId,
          },
          period: Duration.minutes(1),
          statistic: "Sum",
          label: "5XX Errors",
        }),
      ],
      width: 24,
    });

    // Lambda metrics
    const lambdaInvocationsWidget = new aws_cloudwatch.GraphWidget({
      title: "Lambda Invocations",
      left: [
        props.createTimerFunction.metricInvocations({
          period: Duration.minutes(1),
          statistic: "Sum",
          label: "CreateTimer",
        }),
        props.updateTimerFunction.metricInvocations({
          period: Duration.minutes(1),
          statistic: "Sum",
          label: "UpdateTimer",
        }),
        props.cancelTimerFunction.metricInvocations({
          period: Duration.minutes(1),
          statistic: "Sum",
          label: "CancelTimer",
        }),
      ],
      width: 12,
    });

    // Lambda errors
    const lambdaErrorsWidget = new aws_cloudwatch.GraphWidget({
      title: "Lambda Errors",
      left: [
        props.createTimerFunction.metricErrors({
          period: Duration.minutes(1),
          statistic: "Sum",
          label: "CreateTimer",
        }),
        props.updateTimerFunction.metricErrors({
          period: Duration.minutes(1),
          statistic: "Sum",
          label: "UpdateTimer",
        }),
        props.cancelTimerFunction.metricErrors({
          period: Duration.minutes(1),
          statistic: "Sum",
          label: "CancelTimer",
        }),
      ],
      width: 12,
    });

    // Lambda duration
    const lambdaDurationWidget = new aws_cloudwatch.GraphWidget({
      title: "Lambda Duration",
      left: [
        props.createTimerFunction.metricDuration({
          period: Duration.minutes(1),
          statistic: "Average",
          label: "CreateTimer",
        }),
        props.updateTimerFunction.metricDuration({
          period: Duration.minutes(1),
          statistic: "Average",
          label: "UpdateTimer",
        }),
        props.cancelTimerFunction.metricDuration({
          period: Duration.minutes(1),
          statistic: "Average",
          label: "CancelTimer",
        }),
      ],
      width: 12,
    });

    // DynamoDB metrics
    const dynamoDbWidget = new aws_cloudwatch.GraphWidget({
      title: "DynamoDB",
      left: [
        props.dynamoTable.metricConsumedReadCapacityUnits({
          period: Duration.minutes(5),
          statistic: "Sum",
          label: "Read Capacity",
        }),
        props.dynamoTable.metricConsumedWriteCapacityUnits({
          period: Duration.minutes(5),
          statistic: "Sum",
          label: "Write Capacity",
        }),
        props.dynamoTable.metricThrottledRequestsForOperations({
          period: Duration.minutes(5),
          statistic: "Sum",
          label: "Throttled Requests",
        }),
      ],
      width: 12,
    });

    // SNS metrics
    const snsWidget = new aws_cloudwatch.GraphWidget({
      title: "SNS",
      left: [
        new aws_cloudwatch.Metric({
          namespace: "AWS/SNS",
          metricName: "NumberOfMessagesPublished",
          dimensionsMap: {
            TopicName: props.topic.topicName,
          },
          period: Duration.minutes(1),
          statistic: "Sum",
          label: "Messages Published",
        }),
        new aws_cloudwatch.Metric({
          namespace: "AWS/SNS",
          metricName: "NumberOfNotificationsDelivered",
          dimensionsMap: {
            TopicName: props.topic.topicName,
          },
          period: Duration.minutes(1),
          statistic: "Sum",
          label: "Notifications Delivered",
        }),
        new aws_cloudwatch.Metric({
          namespace: "AWS/SNS",
          metricName: "NumberOfNotificationsFailed",
          dimensionsMap: {
            TopicName: props.topic.topicName,
          },
          period: Duration.minutes(1),
          statistic: "Sum",
          label: "Notifications Failed",
        }),
      ],
      width: 12,
    });

    // Step Functions metrics
    const stepFunctionsWidget = new aws_cloudwatch.GraphWidget({
      title: "Step Functions",
      left: [
        new aws_cloudwatch.Metric({
          namespace: "AWS/States",
          metricName: "ExecutionsStarted",
          dimensionsMap: {
            StateMachineArn: props.stateMachine.stateMachineArn,
          },
          period: Duration.minutes(1),
          statistic: "Sum",
          label: "Executions Started",
        }),
        new aws_cloudwatch.Metric({
          namespace: "AWS/States",
          metricName: "ExecutionsSucceeded",
          dimensionsMap: {
            StateMachineArn: props.stateMachine.stateMachineArn,
          },
          period: Duration.minutes(1),
          statistic: "Sum",
          label: "Executions Succeeded",
        }),
        new aws_cloudwatch.Metric({
          namespace: "AWS/States",
          metricName: "ExecutionsFailed",
          dimensionsMap: {
            StateMachineArn: props.stateMachine.stateMachineArn,
          },
          period: Duration.minutes(1),
          statistic: "Sum",
          label: "Executions Failed",
        }),
        new aws_cloudwatch.Metric({
          namespace: "AWS/States",
          metricName: "ExecutionsTimedOut",
          dimensionsMap: {
            StateMachineArn: props.stateMachine.stateMachineArn,
          },
          period: Duration.minutes(1),
          statistic: "Sum",
          label: "Executions Timed Out",
        }),
      ],
      width: 12,
    });

    const timersCreatedWidget = new aws_cloudwatch.GraphWidget({
      title: "Timers Created by Timer Type",
      left: [
        new aws_cloudwatch.MathExpression({
          expression: `SELECT SUM(Success) FROM "the-band-of-misfits" WHERE service = 'jack-in-the-cloud' AND operationId = '${props.createTimerFunction.functionName}' GROUP BY timerType`,
          period: Duration.minutes(1),
          label: "Timers",
        }),
      ],
      width: 12,
    });
    const timersFiredWidget = new aws_cloudwatch.GraphWidget({
      title: "Timers Fired by Timer Type",
      left: [
        new aws_cloudwatch.MathExpression({
          expression: `SELECT SUM(Success) FROM "the-band-of-misfits" WHERE service = 'jack-in-the-cloud' AND operationId = '${props.fireTimerFunction.functionName}' GROUP BY timerType`,
          period: Duration.minutes(1),
          label: "Timers",
        }),
      ],
      width: 12,
    });
    const timersUpdatedWidget = new aws_cloudwatch.GraphWidget({
      title: "Timers Updated by Timer Type",
      left: [
        new aws_cloudwatch.MathExpression({
          expression: `SELECT SUM(Success) FROM \"the-band-of-misfits\" WHERE service = 'jack-in-the-cloud' AND operationId = '${props.updateTimerFunction.functionName}' GROUP BY timerType`,
          period: Duration.minutes(1),
          label: "Timers",
        }),
      ],
      width: 12,
    });
    const timersCancelledWidget = new aws_cloudwatch.GraphWidget({
      title: "Timers Cancelled by Timer Type",
      left: [
        new aws_cloudwatch.MathExpression({
          expression: `SELECT SUM(Success) FROM \"the-band-of-misfits\" WHERE service = 'jack-in-the-cloud' AND operationId = '${props.cancelTimerFunction.functionName}' GROUP BY timerType`,
          period: Duration.minutes(1),
          label: "Timers",
        }),
      ],
      width: 12,
      leftYAxis: {
        min: 0,
      },
    });

    // Add all widgets to the dashboard
    dashboard.addWidgets(
      apiWidget,
      new aws_cloudwatch.Row(lambdaInvocationsWidget, lambdaErrorsWidget),
      new aws_cloudwatch.Row(lambdaDurationWidget, dynamoDbWidget),
      new aws_cloudwatch.Row(snsWidget, stepFunctionsWidget),
      new aws_cloudwatch.Row(timersCreatedWidget, timersFiredWidget),
      new aws_cloudwatch.Row(timersUpdatedWidget, timersCancelledWidget),
    );
  }
}
