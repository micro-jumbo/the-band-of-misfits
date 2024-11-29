import {
  LoggingInterceptor,
  MetricsInterceptor,
  TracingInterceptor,
} from '@the-band-of-misfits/jack-in-the-cloud-api-typescript-runtime';
import {
  TimerProps,
  TimerService,
} from '@the-band-of-misfits/jack-in-the-cloud-service';
import {
  ChainedHandler,
  ChainedRequest,
  handleChainedRequest,
  MonitoringInterceptor,
  PowerTools,
} from '@the-band-of-misfits/jimmy-the-deckhand-utils';
import { dynamoDbClient, snsClient, stepFunctionsClient } from './aws-clients';

const timerService = new TimerService({
  machineArn: process.env.MACHINE_ARN!,
  tableName: process.env.TABLE_NAME!,
  topicArn: process.env.TOPIC_ARN!,
  dynamoDbClient: dynamoDbClient,
  snsClient: snsClient,
  stepFunctionsClient: stepFunctionsClient,
});

const fireTimer: ChainedHandler<TimerProps, any> = async (
  request: ChainedRequest<TimerProps, any>,
) => {
  const { input } = request;
  PowerTools.logger().info('Start FireTimer Operation', { ...input });

  PowerTools.logger().addPersistentLogAttributes({
    timerId: input.id,
  });

  await timerService.fireTimer(input);
  return { statusCode: 200 };
};

export const handler = handleChainedRequest<TimerProps, any>(
  'fireTimer',
  LoggingInterceptor.intercept,
  TracingInterceptor.intercept,
  MetricsInterceptor.intercept,
  MonitoringInterceptor.intercept,
  fireTimer,
);
