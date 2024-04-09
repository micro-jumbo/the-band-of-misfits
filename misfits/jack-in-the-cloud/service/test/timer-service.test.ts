// import { randomUUID } from 'crypto';
import {
  SFNClient,
  StartExecutionCommand,
  StopExecutionCommand,
} from '@aws-sdk/client-sfn';
import { mockClient } from 'aws-sdk-client-mock';
import {
  CancelTimerInput,
  CreateTimerInput,
  TimerService,
} from '../src/timer-service';

import 'aws-sdk-client-mock-jest';
import 'jest';

jest.mock('crypto', () => ({
  randomUUID: jest.fn().mockReturnValue('test-id'),
}));

describe('TimerService', () => {
  let timerService: TimerService;
  const machineArn = 'test-arn';
  const region = 'test-region';
  const stepFunctionsMock = mockClient(SFNClient);

  beforeEach(() => {
    timerService = new TimerService(machineArn, region);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a timer and return the timer ID', async () => {
    // Arrange
    const input: CreateTimerInput = {
      type: 'test-type',
      fireAt: '2023-01-01T00:00:00Z',
      payload: JSON.stringify({ test: 'payload' }),
    };

    const expectedId = 'test-id';
    stepFunctionsMock.on(StartExecutionCommand).resolves({});

    // Act
    const result = await timerService.createTimer(input);

    // Assert
    expect(stepFunctionsMock).toHaveReceivedCommandWith(StartExecutionCommand, {
      stateMachineArn: machineArn,
      name: expectedId,
      input: JSON.stringify({
        ...input,
        id: expectedId,
      }),
    });
    expect(result).toEqual({ id: expectedId });
  });

  it('should throw an error if the fireAt is not a valid ISO date string', async () => {
    const input: CreateTimerInput = {
      fireAt: 'invalid-date',
      payload: '{}',
      type: 'test',
    };
    await expect(timerService.createTimer(input)).rejects.toThrow(
      'fireAt not a valid date - [invalid-date]',
    );
  });

  it('should cancel a timer', async () => {
    // Arrange
    const input: CancelTimerInput = {
      id: 'test-id',
    };

    const executionArn = `${machineArn.replace(':stateMachine:', ':execution:')}:${input.id}`;

    stepFunctionsMock.on(StopExecutionCommand).resolves({});

    // Act
    await timerService.cancelTimer(input);

    // Assert
    expect(stepFunctionsMock).toHaveReceivedCommandWith(StopExecutionCommand, {
      executionArn,
      cause: 'Cancelled by API',
    });
  });
});
