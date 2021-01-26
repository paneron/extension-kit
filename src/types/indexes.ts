import { Progress } from './progress';

// Describes status of a filtered (or future custom) object index of a dataset
export interface IndexStatus {
  objectCount: number
  progress?: Progress
}
