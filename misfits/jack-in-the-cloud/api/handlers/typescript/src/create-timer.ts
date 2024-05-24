import {
  CreateTimerChainedHandlerFunction,
  CreateTimerChainedRequestInput,
  createTimerHandler,
  CreateTimerOperationResponses,
  INTERCEPTORS,
  LoggingInterceptor,
} from '@the-band-of-misfits/jack-in-the-cloud-api-typescript-runtime';
import {
  CreateTimerInput,
  TimerService,
} from '@the-band-of-misfits/jack-in-the-cloud-service';
import { ISO8601 } from '@the-band-of-misfits/jimmy-the-deckhand-utils';

const timerService = new TimerService(
  process.env.MACHINE_ARN!,
  process.env.TABLE_NAME!,
);

/**
 * Type-safe handler for the CreateTimer operation
 */
export const createTimer: CreateTimerChainedHandlerFunction = async (
  request: CreateTimerChainedRequestInput,
): Promise<CreateTimerOperationResponses> => {
  LoggingInterceptor.getLogger(request).info('Start CreateTimer Operation');

  const {
    input: { body },
  } = request;

  const createTimerInput: CreateTimerInput = {
    id: body.id,
    type: body.type || 'DEFAULT',
    fireAt: ISO8601.fromDate(body.fireAt),
    payload: body.payload,
  };

  const result = await timerService.createTimer(createTimerInput);
  return { statusCode: 200, body: result };
};

/**
 * Entry point for the AWS Lambda handler for the CreateTimer operation.
 * The createTimerHandler method wraps the type-safe handler and manages marshalling inputs and outputs
 */
export const handler = createTimerHandler(...INTERCEPTORS, createTimer);
