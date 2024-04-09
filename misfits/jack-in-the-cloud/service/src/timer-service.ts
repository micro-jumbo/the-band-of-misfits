import { randomUUID } from 'crypto';
import {
  SFNClient,
  StartExecutionCommand,
  StopExecutionCommand,
} from '@aws-sdk/client-sfn';
import { isValidISODateString } from 'iso-datestring-validator';
import { TimerProps } from './types';

export type CreateTimerInput = Omit<TimerProps, 'id'>;
export type CreateTimerOutput = Pick<TimerProps, 'id'>;
export type CancelTimerInput = Pick<TimerProps, 'id'>;

export class TimerService {
  private readonly stepFunctionsClient: SFNClient;
  private readonly machineArn: string;

  constructor(machineArn: string, region: string) {
    this.machineArn = machineArn;
    this.stepFunctionsClient = new SFNClient({ region });
  }

  async createTimer(input: CreateTimerInput): Promise<CreateTimerOutput> {
    this.validate(input);
    const id = randomUUID();
    console.info(`Creating timer ${id}`, input);
    await this.stepFunctionsClient.send(
      new StartExecutionCommand({
        stateMachineArn: this.machineArn,
        name: id,
        input: JSON.stringify({
          ...input,
          id,
        }),
      }),
    );
    return { id };
  }

  async cancelTimer(input: CancelTimerInput): Promise<void> {
    console.info(`Cancelling timer ${input.id}`);
    const executionArn = `${this.machineArn.replace(':stateMachine:', ':execution:')}:${input.id}`;
    console.info(`Execution ARN: ${executionArn}`);
    await this.stepFunctionsClient.send(
      new StopExecutionCommand({
        executionArn,
        cause: 'Cancelled by API',
      }),
    );
  }

  validate(timer: Partial<TimerProps>) {
    if (timer.fireAt) {
      if (!isValidISODateString(timer.fireAt)) {
        throw new Error(`fireAt not a valid date - [${timer.fireAt}]`);
      }
    }
  }
}
