/**
 * An (abstract) hook that wraps React’s useReducer hook and handles storing and loading reducer state
 * using provided functions.
 */

import { useReducer, useEffect, useCallback, useState } from 'react';
import { isObject } from './util';
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

  /** Loaded state. */
  payload: S
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
 *
 * NOTE: that state S cannot be an empty object,
 * in such a case `initialState` will always be used.
 */
function usePersistentStateReducer<S, A extends BaseAction>(
  storeState: (key: string, newState: S) => void,
  loadState: (key: string) => Promise<S | undefined>,
  ...args: Parameters<PersistentStateReducerHook<S, A>>
): [state: S, dispatch: Dispatch<A>, initialized: boolean] {
  const [storageKey, storageDebounceMS, validator, reducer, initialState, initializer] = args;

  const effectiveReducer = useCallback(convertToPersistentReducer(reducer), [reducer]);
  const [state, dispatch] = useReducer(effectiveReducer, initialState, initializer ?? defaultInitializer)

  if (!isObject(initialState)) {
    console.error("usePersistentStateReducer: initialState is not an object", initialState);
    throw new Error("initialState is not an object");
  }

  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    setInitialized(false);
    let cancelled = false;
    (async () => {
      const loadedState = await loadState(storageKey);
      if (cancelled) { return; }

      let effectiveState: S | undefined;
      if (loadedState && isObject(loadedState) && Object.keys(loadedState).length > 0) {
        if (validator) {
          if (validator(loadedState)) {
            effectiveState = loadedState;
          } else {
            console.error("usePersistentStateReducer: Failed to validate loaded state for key", storageKey, loadedState, initialState);
            effectiveState = initialState;
          }
        } else {
          effectiveState = loadedState || initialState;
        }
      } else {
        effectiveState = initialState;
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


  const debounceDelay = storageDebounceMS ?? DEFAULT_DEBOUNCE_DELAY;
  useEffect(() => {
    if (initialized === true) {
      let timeout = setTimeout(() => {
        storeState(storageKey, state);
      }, debounceDelay);
      return () => clearTimeout(timeout);
    }
    return () => void 0;
  }, [debounceDelay, storeState, storageKey, state]);

  const effectiveState = state && Object.keys(state).length > 0
    ? state
    : initialState;

  return [effectiveState, dispatch, initialized];
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
  return function wrappedReducer(prevState: S, action: A | LoadStateAction<S>) {
    switch (action.type) {
      case LOAD_STATE_ACTION_TYPE:
        if (isObject((action as LoadStateAction<S>).payload)) {
          // TODO: Why action type needs casting, not narrowed?
          return { ...action.payload };
        } else {
          console.error("usePersistentStateReducer: Loaded state is not an object", action?.payload);
          throw new Error("Invalid state loaded: not an object");
        }
      default:
        return reducer(prevState, action as A);
    }
  }
}

function defaultInitializer<T>(s: T) { return s }

async function noOpLoadState() { return {} }

export const initialHook: PersistentStateReducerHook<any, any> =
  (...args: Parameters<PersistentStateReducerHook<any, any>>) =>
    usePersistentStateReducer(() => void 0, noOpLoadState, ...args);
