import {
  CancelTimerChainedHandlerFunction,
  cancelTimerHandler,
  INTERCEPTORS,
  LoggingInterceptor,
} from '@the-band-of-misfits/jack-in-the-cloud-api-typescript-runtime';
import {
  CancelTimerInput,
  TimerService,
} from '@the-band-of-misfits/jack-in-the-cloud-service';

const timerService = new TimerService(
  process.env.MACHINE_ARN!,
  process.env.TABLE_NAME!,
);

/**
 * Type-safe handler for the CancelTimer operation
 */
export const cancelTimer: CancelTimerChainedHandlerFunction = async (
  request,
) => {
  LoggingInterceptor.getLogger(request).info('Start CancelTimer Operation');

  const {
    input: { body },
  } = request;

  const createTimerInput: CancelTimerInput = {
    id: body.id,
  };

  await timerService.cancelTimer(createTimerInput);
  return { statusCode: 200, body: { result: 'CANCELLED' } };
};

/**
 * Entry point for the AWS Lambda handler for the CancelTimer operation.
 * The cancelTimerHandler method wraps the type-safe handler and manages marshalling inputs and outputs
 */
export const handler = cancelTimerHandler(...INTERCEPTORS, cancelTimer);
