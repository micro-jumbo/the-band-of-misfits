import { MetricUnits } from '@aws-lambda-powertools/metrics';
import {
  CreateTimerChainedHandlerFunction,
  CreateTimerChainedRequestInput,
  createTimerHandler,
  CreateTimerOperationResponses,
  INTERCEPTORS,
  LoggingInterceptor,
  MetricsInterceptor,
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
  const start = new Date().getTime();
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

  const end = new Date().getTime();
  MetricsInterceptor.getMetrics(request).addMetric(
    'duration',
    MetricUnits.Milliseconds,
    end - start,
  );
  console.log(
    `Metrics: ${JSON.stringify(MetricsInterceptor.getMetrics(request))}`,
  ); // eslint-disable-line no-console
  // MetricsInterceptor.getMetrics(request).publishStoredMetrics();
  // console.log(`Metrics: ${MetricsInterceptor.getMetrics(request).getMetrics(request)}
  return { statusCode: 200, body: result };
};

/**
 * Entry point for the AWS Lambda handler for the CreateTimer operation.
 * The createTimerHandler method wraps the type-safe handler and manages marshalling inputs and outputs
 */
export const handler = createTimerHandler(...INTERCEPTORS, createTimer);
