import {
  SFNClient,
  StartExecutionCommand,
  StopExecutionCommand,
} from '@aws-sdk/client-sfn';
import 'aws-sdk-client-mock-jest';
import 'jest';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';
import { ISO8601 } from '@the-band-of-misfits/jimmy-the-deckhand-utils';
import { mockClient } from 'aws-sdk-client-mock';
import {
  CancelTimerInput,
  CreateTimerInput,
  DbTimerProps,
  TimerService,
} from '../src';

describe('TimerService', () => {
  let timerService: TimerService;
  const machineArn = 'test-arn';
  const tableName = 'test-table';
  const stepFunctionsMock = mockClient(SFNClient);
  const dynamoDbMock = mockClient(DynamoDBDocumentClient);

  beforeEach(() => {
    timerService = new TimerService(machineArn, tableName);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a timer and return the timer ID', async () => {
    // Arrange
    const fireAt = ISO8601.add(ISO8601.now(), 5, 'minutes');
    const input: CreateTimerInput = {
      id: 'test-id',
      type: 'test-type',
      fireAt,
      payload: JSON.stringify({ test: 'payload' }),
    };

    stepFunctionsMock.on(StartExecutionCommand).resolves({});
    dynamoDbMock.on(PutCommand).resolves({});

    // Act
    const result = await timerService.createTimer(input);

    // Assert
    const timer = {
      ...input,
      executionId: expect.any(String),
      ttl: ISO8601.toDate(fireAt).getTime(),
    };
    expect(stepFunctionsMock).toHaveReceivedCommandWith(StartExecutionCommand, {
      stateMachineArn: machineArn,
      name: expect.any(String),
      input: JSON.stringify(result),
    });
    expect(dynamoDbMock).toHaveReceivedCommandWith(PutCommand, {
      TableName: tableName,
      Item: timer,
      ConditionExpression: 'attribute_not_exists(id)',
    });

    expect(result).toEqual({
      ...input,
      executionId: expect.any(String),
      ttl: ISO8601.toDate(fireAt).getTime(),
    });
  });

  it('should cancel a timer', async () => {
    // Arrange
    const input: CancelTimerInput = {
      id: 'test-id',
    };
    const fireAt = ISO8601.add(ISO8601.now(), 5, 'minutes');
    const timer: DbTimerProps = {
      id: input.id,
      type: 'test-type',
      fireAt,
      payload: JSON.stringify({ test: 'payload' }),
      executionId: 'test-execution-id',
      ttl: ISO8601.toDate(fireAt).getTime(),
    };

    dynamoDbMock.on(GetCommand).resolves({ Item: timer });
    stepFunctionsMock.on(StopExecutionCommand).resolves({});
    dynamoDbMock.on(DeleteCommand).resolves({});

    // Act
    await timerService.cancelTimer(input);

    // Assert
    expect(dynamoDbMock).toHaveReceivedCommandWith(GetCommand, {
      TableName: tableName,
      Key: { id: input.id },
    });
    expect(stepFunctionsMock).toHaveReceivedCommandWith(StopExecutionCommand, {
      executionArn: `${machineArn.replace(':stateMachine:', ':execution:')}:${timer.executionId}`,
      cause: 'Cancelled by API',
    });
    expect(dynamoDbMock).toHaveReceivedCommandWith(DeleteCommand, {
      TableName: tableName,
      Key: { id: input.id },
    });
  });
});
