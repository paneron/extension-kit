/**
 * An (abstract) hook that wraps React’s useReducer hook and handles storing and loading reducer state
 * using provided functions.
 */

import { useReducer, useEffect, useCallback, useState } from 'react';
import type { Reducer, Dispatch } from 'react';


const DEFAULT_DEBOUNCE_DELAY = 200;

const LOAD_STATE_ACTION_TYPE = 'loadedState' as const;


export interface BaseAction {
  type: string
  payload?: any
}


/** Action issued when previously stored state is loaded. */
export interface LoadStateAction<S> extends BaseAction {
  type: typeof LOAD_STATE_ACTION_TYPE
  payload?: S
}


export type StateReducerHook<S, A extends BaseAction> =
  (
    reducer: Reducer<S, A>,
    initialState: S,
    initializer: ((initialState: S) => S) | null,
  ) => [state: S, dispatch: Dispatch<A>];

export type PersistentStateReducerHook<S, A extends BaseAction> =
  (
    /** Each component should specify a unique storage key. */
    storageKey: string,

    /**
     * Calls to store state will be debounced according to this delay
     * in case state change too often.
     */
    storageDebounceMS?: number,

    validateLoadedState?: (loadedValue: Partial<S> & any) => loadedValue is S,

    ...args: Parameters<StateReducerHook<S, A>>
  ) => [state: S, dispatch: Dispatch<A>, stateRecalled: boolean];



/**
 * A reducer that persists each new state,
 * and attempts to load persisted state when component is mounted.
 *
 * During the initial load, `initialized` is set to false.
 *
 * `storeState` is called on each change of state but debounced.
 */
function usePersistentStateReducer<S, A extends BaseAction>(
  storeState: (key: string, newState: S) => void,
  loadState: (key: string) => Promise<S | undefined>,
  ...args: Parameters<PersistentStateReducerHook<S, A>>
): [state: S, dispatch: Dispatch<A>, initialized: boolean] {
  const [storageKey, storageDebounceMS, validator, reducer, initialState, initializer] = args;

  const debounceDelay = storageDebounceMS ?? DEFAULT_DEBOUNCE_DELAY;

  const effectiveReducer = useCallback(convertToPersistentReducer(reducer), [reducer]);

  const [initialized, setInitialized] = useState(false);
  const [state, dispatch] = initializer
    ? useReducer(effectiveReducer, initialState, initializer)
    : useReducer(effectiveReducer, initialState);

  useEffect(() => {
    setInitialized(false);
    let cancelled = false;
    (async () => {
      const loadedState = await loadState(storageKey);
      if (cancelled) { return; }

      let effectiveState: S | undefined;
      if (loadedState && validator) {
        if (validator(loadedState)) {
          effectiveState = loadedState;
        } else {
          effectiveState = initialState;
        }
      } else {
        effectiveState = loadedState ?? initialState;
      }
      dispatch({
        type: LOAD_STATE_ACTION_TYPE,
        payload: effectiveState,
      });
      setInitialized(true);
    })();
    return function cleanUp() {
      cancelled = true;
    }
  }, [dispatch, validator, loadState, initialState, storageKey]);

  useEffect(() => {
    if (initialized === true) {
      let timeout = setTimeout(() => {
        storeState(storageKey, state);
      }, debounceDelay);
      return () => clearTimeout(timeout);
    }
    return () => void 0;
  }, [storeState, storageKey, state]);

  return [state, dispatch, initialized];
}


export default usePersistentStateReducer;



/**
 * Creates a reducer that handles a special `loadedState` action,
 * relevant to persistent state reducer, in addition to any other
 * action handled by component-specific reducer function passed in.
 */
function convertToPersistentReducer<S, A extends BaseAction>(
  reducer: Reducer<S, A>,
): Reducer<S, A | LoadStateAction<S>> {
  return (prevState: S, action: A | LoadStateAction<S>) => {
    switch (action.type) {
      case LOAD_STATE_ACTION_TYPE:
        return action.payload;
      default:
        return reducer(prevState, action as A);
    }
  }
}

async function noOpLoadState() { return {} }

export const initialHook: PersistentStateReducerHook<any, any> =
  (...args: Parameters<PersistentStateReducerHook<any, any>>) =>
    usePersistentStateReducer(() => void 0, noOpLoadState, ...args);
