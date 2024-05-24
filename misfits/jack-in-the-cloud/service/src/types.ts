import { ISO8601DateTime } from '@the-band-of-misfits/jimmy-the-deckhand-utils';

export interface TimerProps {
  id: string;
  type: string;
  fireAt: ISO8601DateTime;
  payload: string;
}

export type DbTimerProps = TimerProps & {
  executionId: string;
  ttl: number;
};
