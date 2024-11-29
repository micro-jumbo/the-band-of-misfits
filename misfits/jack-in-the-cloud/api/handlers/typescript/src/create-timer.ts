import { randomUUID } from 'crypto';
import {
  CreateTimerChainedHandlerFunction,
  CreateTimerChainedRequestInput,
  createTimerHandler,
  CreateTimerOperationResponses,
  INTERCEPTORS,
} from '@the-band-of-misfits/jack-in-the-cloud-api-typescript-runtime';
import {
  CreateTimerInput,
  TimerService,
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
 * Type-safe handler for the CreateTimer operation
 */
export const createTimer: CreateTimerChainedHandlerFunction = async (
  request: CreateTimerChainedRequestInput,
): Promise<CreateTimerOperationResponses> => {
  const {
    input: { body },
  } = request;

  PowerTools.logger().info('Start CreateTimer Operation', { ...body });

  const createTimerInput: CreateTimerInput = {
    id: body.id ?? randomUUID(),
    type: body.type || 'DEFAULT',
    fireAt: ISO8601.fromDate(body.fireAt),
    payload: body.payload,
  };
  PowerTools.logger().addPersistentLogAttributes({
    timerId: createTimerInput.id,
  });

  const result = await timerService.createTimer(createTimerInput);
  return { statusCode: 200, body: result };
};

/**
 * Entry point for the AWS Lambda handler for the CreateTimer operation.
 * The createTimerHandler method wraps the type-safe handler and manages marshalling inputs and outputs
 */
export const handler = createTimerHandler(
  ...INTERCEPTORS,
  MonitoringInterceptor.intercept,
  createTimer,
);
