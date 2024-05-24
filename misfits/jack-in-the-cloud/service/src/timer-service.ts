import { randomUUID } from 'crypto';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  SFNClient,
  StartExecutionCommand,
  StopExecutionCommand,
} from '@aws-sdk/client-sfn';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';
import {
  ISO8601,
  PartialBy,
} from '@the-band-of-misfits/jimmy-the-deckhand-utils';
import { DbTimerProps, TimerProps } from './types';

export type CreateTimerInput = PartialBy<TimerProps, 'id'>;
export type CreateTimerOutput = DbTimerProps;
export type CancelTimerInput = Pick<TimerProps, 'id'>;
export type UpdateTimerInput = TimerProps;
export type UpdateTimerOutput = DbTimerProps;

export class TimerService {
  private readonly machineArn: string;
  private readonly tableName: string;
  private readonly dynamoDbClient: DynamoDBDocumentClient;
  private readonly stepFunctionsClient: SFNClient;

  constructor(machineArn: string, tableName: string) {
    this.machineArn = machineArn;
    this.tableName = tableName;
    this.dynamoDbClient = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
      marshallOptions: {},
    });
    this.stepFunctionsClient = new SFNClient({});
  }

  async createTimer(input: CreateTimerInput): Promise<CreateTimerOutput> {
    console.log('Creating timer', input);
    console.log('with config', this.machineArn, this.tableName);
    this.validate(input);

    const timer: DbTimerProps = {
      ...input,
      id: input.id ?? randomUUID(),
      executionId: randomUUID(),
      ttl: ISO8601.toDate(ISO8601.fromString(input.fireAt)).getTime(),
    };
    console.info(`Creating timer ${timer.id}`, input);
    await this.stepFunctionsClient.send(
      new StartExecutionCommand({
        stateMachineArn: this.machineArn,
        name: timer.executionId,
        input: JSON.stringify(timer),
      }),
    );
    await this.dynamoDbClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: timer,
        ConditionExpression: 'attribute_not_exists(id)',
      }),
    );

    return timer;
  }

  async cancelTimer(input: CancelTimerInput): Promise<void> {
    console.info(`Cancelling timer ${input.id}`);
    const result = await this.dynamoDbClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { id: input.id },
      }),
    );
    const timer: DbTimerProps = result.Item as DbTimerProps;
    const executionArn = `${this.machineArn.replace(':stateMachine:', ':execution:')}:${timer.executionId}`;
    console.info(`Execution ARN: ${executionArn}`);
    await this.stepFunctionsClient.send(
      new StopExecutionCommand({
        executionArn,
        cause: 'Cancelled by API',
      }),
    );
    await this.dynamoDbClient.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: { id: input.id },
      }),
    );
  }

  async updateTimer(input: TimerProps): Promise<UpdateTimerOutput> {
    this.validate(input);
    console.info(`Updating timer ${input.id}`, input);

    await this.cancelTimer({ id: input.id });
    return this.createTimer(input);
  }

  validate(timer: PartialBy<TimerProps, 'id'>) {
    if (ISO8601.isBefore(timer.fireAt, ISO8601.now())) {
      throw new Error('fireAt must be in the future');
    }
    if (
      ISO8601.isAfter(timer.fireAt, ISO8601.add(ISO8601.now(), 365, 'days'))
    ) {
      throw new Error('fireAt must be within 1 year');
    }
  }
}
