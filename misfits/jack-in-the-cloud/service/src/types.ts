export type ISO8601DateTime = string;

export interface TimerProps {
  id: string;
  type: string;
  fireAt: ISO8601DateTime;
  payload: string;
}
