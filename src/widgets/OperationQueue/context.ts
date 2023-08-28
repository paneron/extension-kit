import React from 'react';
import type { OperationOptions } from './types';


export interface ContextSpec {
  /**
   * If there is any operation marked “blocking” in progress.
   */
  isBusy: boolean;

  /**
   * Takes a verb and a function that performs some action.
   * Returns a wrapper function that calls the given async action function
   * and updates the status in GUI.
   */
  performOperation: <P extends unknown[], R>(
    gerund: string,
    func: (...args: P) => Promise<R>,
    opts?: OperationOptions,
  ) => (...args: P) => Promise<R>;
}


export const INITIAL_CONTEXT: ContextSpec = {
  isBusy: false,
  performOperation: (_, f) => f,
}


const OperationQueueContext = React.createContext<ContextSpec>(INITIAL_CONTEXT);
export default OperationQueueContext;
