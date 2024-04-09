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

const timerService = new TimerService(
  process.env.JACK_MACHINE_ARN!,
  process.env.AWS_REGION!,
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
    type: body.type || 'DEFAULT',
    fireAt: body.fireAt.toISOString(),
    payload: body.payload,
  };

  const result = await timerService.createTimer(createTimerInput);
  return { statusCode: 200, body: { id: result.id } };
};

/**
 * Entry point for the AWS Lambda handler for the CreateTimer operation.
 * The createTimerHandler method wraps the type-safe handler and manages marshalling inputs and outputs
 */
export const handler = createTimerHandler(...INTERCEPTORS, createTimer);
