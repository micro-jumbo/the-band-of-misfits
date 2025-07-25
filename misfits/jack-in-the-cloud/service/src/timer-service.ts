import { randomUUID } from 'crypto';
import { SFNClient, StartExecutionCommand, StopExecutionCommand } from '@aws-sdk/client-sfn';
import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { ISO8601, PowerTools } from '@the-band-of-misfits/jimmy-the-deckhand-utils';
import { DbTimerProps, TimerProps } from './types';

export type CreateTimerInput = TimerProps;
export type CreateTimerOutput = DbTimerProps;
export type CancelTimerInput = Pick<TimerProps, 'id'>;
export type UpdateTimerInput = TimerProps;
export type UpdateTimerOutput = DbTimerProps;

export interface TimerServiceProps {
  machineArn: string;
  tableName: string;
  topicArn: string;
  dynamoDbClient: () => DynamoDBDocumentClient;
  stepFunctionsClient: () => SFNClient;
  snsClient: () => SNSClient;
}

export class TimerService {
  constructor(private readonly props: TimerServiceProps) {
  }

  private monitor(timer: TimerProps) {
    PowerTools.metrics().addDimension('timerType', timer.type);
    PowerTools.tracer().putAnnotation('timerType', timer.type);
    PowerTools.logger().addPersistentLogAttributes({ timerId: timer.id });
  }

  async createTimer(input: CreateTimerInput): Promise<CreateTimerOutput> {
    this.monitor(input);
    PowerTools.logger().info('Creating timer', JSON.stringify(input));
    this.validate(input);

    const timer: DbTimerProps = {
      ...input,
      id: input.id,
      executionId: randomUUID(),
      ttl: ISO8601.toDate(ISO8601.fromString(input.fireAt)).getTime(),
    };
    await this.props.stepFunctionsClient().send(
      new StartExecutionCommand({
        stateMachineArn: this.props.machineArn,
        name: timer.executionId,
        input: JSON.stringify(timer),
      }),
    );
    await this.props.dynamoDbClient().send(
      new PutCommand({
        TableName: this.props.tableName,
        Item: timer,
        ConditionExpression: 'attribute_not_exists(id)',
      }),
    );
    PowerTools.logger().info('Timer created');
    return timer;
  }

  async cancelTimer(input: CancelTimerInput): Promise<void> {
    PowerTools.logger().info(`Cancelling timer ${input.id}`);
    const result = await this.props.dynamoDbClient().send(
      new GetCommand({
        TableName: this.props.tableName,
        Key: { id: input.id },
      }),
    );
    const timer: DbTimerProps = result.Item as DbTimerProps;
    this.monitor(timer);

    const executionArn = `${this.props.machineArn.replace(':stateMachine:', ':execution:')}:${timer.executionId}`;
    PowerTools.logger().info(`Execution ARN: ${executionArn}`);
    await this.props.stepFunctionsClient().send(
      new StopExecutionCommand({
        executionArn,
        cause: 'Cancelled by API',
      }),
    );
    await this.props.dynamoDbClient().send(
      new DeleteCommand({
        TableName: this.props.tableName,
        Key: { id: input.id },
      }),
    );
    PowerTools.logger().info('Timer cancelled');
  }

  async updateTimer(input: TimerProps): Promise<UpdateTimerOutput> {
    this.monitor(input);
    this.validate(input);
    PowerTools.logger().info(`Updating timer ${input.id}`, JSON.stringify(input));

    await this.cancelTimer({ id: input.id });
    const result = this.createTimer(input);
    PowerTools.logger().info('Timer updated');
    return result;
  }

  async fireTimer(input: TimerProps): Promise<void> {
    this.monitor(input);
    PowerTools.logger().info(`Firing timer ${input.id}`, JSON.stringify(input));
    if (ISO8601.isBefore(ISO8601.now(), input.fireAt)) {
      throw new Error('Timer not ready to be fired');
    }
    await this.props.snsClient().send(
      new PublishCommand({
        TopicArn: this.props.topicArn,
        Message: input.payload,
        MessageAttributes: {
          type: { DataType: 'String', StringValue: input.type },
        },
      }),
    );
    PowerTools.logger().info('Timer fired');
  }

  validate(timer: TimerProps) {
    if (ISO8601.isBefore(timer.fireAt, ISO8601.now())) {
      throw new Error('fireAt must be in the future');
    }
    if (ISO8601.isAfter(timer.fireAt, ISO8601.add(ISO8601.now(), 365, 'days'))) {
      throw new Error('fireAt must be within 1 year');
    }
  }
}
