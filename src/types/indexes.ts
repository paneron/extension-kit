import { Progress } from './progress';

// Describes status of a filtered (or future custom) object index of a dataset
export interface IndexStatus {
  objectCount: number
  progress?: Progress
}


export const INITIAL_INDEX_STATUS: IndexStatus = {
  objectCount: 0,
  progress: {
    phase: 'initializing',
    total: 0,
    loaded: 0,
  },
}
