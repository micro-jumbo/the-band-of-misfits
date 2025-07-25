import {
  INTERCEPTORS,
  UpdateTimerChainedHandlerFunction,
  UpdateTimerChainedRequestInput,
  updateTimerHandler,
  UpdateTimerOperationResponses,
} from '@the-band-of-misfits/jack-in-the-cloud-api-typescript-runtime';
import {
  TimerService,
  UpdateTimerInput,
} from '@the-band-of-misfits/jack-in-the-cloud-service';
import {
  ISO8601,
  MonitoringInterceptor,
  PowerTools,
} from '@the-band-of-misfits/jimmy-the-deckhand-utils';
import { dynamoDbClient, snsClient, stepFunctionsClient } from './aws-clients';

const timerService = new TimerService({
  machineArn: process.env.MACHINE_ARN!,
  tableName: process.env.TABLE_NAME!,
  topicArn: process.env.TOPICS_ARN!,
  dynamoDbClient: dynamoDbClient,
  snsClient: snsClient,
  stepFunctionsClient: stepFunctionsClient,
});

/**
 * Type-safe handler for the UpdateTimer operation
 */
export const updateTimer: UpdateTimerChainedHandlerFunction = async (
  request: UpdateTimerChainedRequestInput,
): Promise<UpdateTimerOperationResponses> => {
  PowerTools.logger().info('Start UpdateTimer Operation');

  const {
    input: { body },
  } = request;

  const updateTimerInput: UpdateTimerInput = {
    id: body.id,
    type: body.type || 'DEFAULT',
    fireAt: ISO8601.fromDate(body.fireAt),
    payload: body.payload,
  };

  const result = await timerService.updateTimer(updateTimerInput);
  return { statusCode: 200, body: result };
};

/**
 * Entry point for the AWS Lambda handler for the UpdateTimer operation.
 * The updateTimerHandler method wraps the type-safe handler and manages marshalling inputs and outputs
 */
export const handler = updateTimerHandler(
  ...INTERCEPTORS,
  MonitoringInterceptor.intercept,
  updateTimer,
);
