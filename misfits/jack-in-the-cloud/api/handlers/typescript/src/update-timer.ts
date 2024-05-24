import {
  INTERCEPTORS,
  LoggingInterceptor,
  UpdateTimerChainedHandlerFunction,
  UpdateTimerChainedRequestInput,
  updateTimerHandler,
  UpdateTimerOperationResponses,
} from '@the-band-of-misfits/jack-in-the-cloud-api-typescript-runtime';
import {
  TimerService,
  UpdateTimerInput,
} from '@the-band-of-misfits/jack-in-the-cloud-service';
import { ISO8601 } from '@the-band-of-misfits/jimmy-the-deckhand-utils';

const timerService = new TimerService(
  process.env.MACHINE_ARN!,
  process.env.TABLE_NAME!,
);

/**
 * Type-safe handler for the UpdateTimer operation
 */
export const updateTimer: UpdateTimerChainedHandlerFunction = async (
  request: UpdateTimerChainedRequestInput,
): Promise<UpdateTimerOperationResponses> => {
  LoggingInterceptor.getLogger(request).info('Start UpdateTimer Operation');

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
export const handler = updateTimerHandler(...INTERCEPTORS, updateTimer);
