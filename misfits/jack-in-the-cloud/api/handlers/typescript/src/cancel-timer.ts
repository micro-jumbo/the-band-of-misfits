import {
  CancelTimerChainedHandlerFunction,
  cancelTimerHandler,
  INTERCEPTORS,
} from "@the-band-of-misfits/jack-in-the-cloud-api-typescript-runtime";
import {
  CancelTimerInput,
  TimerService,
} from "@the-band-of-misfits/jack-in-the-cloud-service";
import {
  MonitoringInterceptor,
  PowerTools,
} from "@the-band-of-misfits/jimmy-the-deckhand-utils";
import { dynamoDbClient, snsClient, stepFunctionsClient } from "./aws-clients";

const timerService = new TimerService({
  machineArn: process.env.MACHINE_ARN!,
  tableName: process.env.TABLE_NAME!,
  topicArn: process.env.TOPICS_ARN!,
  dynamoDbClient: dynamoDbClient,
  snsClient: snsClient,
  stepFunctionsClient: stepFunctionsClient,
});

/**
 * Type-safe handler for the CancelTimer operation
 */
export const cancelTimer: CancelTimerChainedHandlerFunction = async (
  request,
) => {
  PowerTools.logger().info("Start CancelTimer Operation");

  const {
    input: { body },
  } = request;

  const createTimerInput: CancelTimerInput = {
    id: body.id,
  };

  await timerService.cancelTimer(createTimerInput);
  return { statusCode: 200, body: { result: "CANCELLED" } };
};

/**
 * Entry point for the AWS Lambda handler for the CancelTimer operation.
 * The cancelTimerHandler method wraps the type-safe handler and manages marshalling inputs and outputs
 */
export const handler = cancelTimerHandler(
  ...INTERCEPTORS,
  MonitoringInterceptor.intercept,
  cancelTimer,
);
