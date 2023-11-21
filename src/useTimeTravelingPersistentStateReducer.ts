import produce, { type Draft } from 'immer';
import type { Dispatch } from 'react';
import type { BaseAction, PersistentStateReducerHook, StateReducerHook } from './usePersistentStateReducer';


const UNDO_ACTION_TYPE = 'undo' as const;
const REDO_ACTION_TYPE = 'redo' as const;
const RESET_ACTION_TYPE = 'reset' as const;

export interface UndoAction extends BaseAction {
  type: typeof UNDO_ACTION_TYPE;
}

export interface RedoAction extends BaseAction {
  type: typeof REDO_ACTION_TYPE;
}

export interface ResetAction extends BaseAction {
  type: typeof RESET_ACTION_TYPE;
}

export type TimeTravelAction = UndoAction | RedoAction | ResetAction;

interface Timeline<S> {
  present: S;

  /** States that led to present state. */
  past: S[];

  /**
   * Undoing a state makes present state first future state,
   * and last past state the present.
   */
  future: S[];
}

type TimeTravelingPersistentStateReducerHookParams<S, A extends BaseAction> = [

  /** How far back to allow the state to be rewound. */
  maxHistorySteps: number,

  /** Persistent reducer hook iplementation to delegate to. */
  usePersistentReducer: PersistentStateReducerHook<Timeline<S>, A | TimeTravelAction>,

  // These are duplicated from PersistentStateReducerHook

  /** Each component should specify a unique storage key. */
  storageKey: string,

  /**
   * Calls to store state will be debounced according to this delay
   * in case state change too often.
   */
  storageDebounceMS?: number,

  validateLoadedState?: (loadedValue: any) => loadedValue is S,

  ...stateReducerHookArgs: Parameters<StateReducerHook<S, A>>
];

export type TimeTravelingPersistentStateReducerHook<S, A extends BaseAction> =
  (...args: TimeTravelingPersistentStateReducerHookParams<S, A>) =>
    TimeTravelingPersistentStateReducerInterface<S, A>;

interface TimeTravelingPersistentStateReducerInterface<S, A extends BaseAction> {
  /** Present state. */
  state: S;

  /** Supports actions by wrapped reduce, and time-traveling actions below. */
  dispatch: Dispatch<A>;

  /**
   * Go to previous state in the timeline;
   * present state will become next “future” state.
   */
  undo: () => void;

  /** Makes next (if any) “future” state in the timeline present. */
  redo: () => void;

  /**
   * Resetting rewinds the timeline back to the beginning.
   * All states are future states.
   * Redoing is still possible (in that sense it’s not a proper reset).
   */
  reset: () => void;

  // TODO: Implenment “proper” reset that makes initial state present
  // and also clears past and future.

  /** State change history. */
  timeline: Timeline<S>;

  /** Proxied from persistent reducer. */
  initialized: boolean;
}

/**
 * Supports persistent state reducer features,
 * but also offers time travel through undo/redo/reset actions.
 */
export function useTimeTravelingPersistentStateReducer<S, A extends BaseAction>(
  ...args: TimeTravelingPersistentStateReducerHookParams<S, A>
): TimeTravelingPersistentStateReducerInterface<S, A> {
  const [maxHistorySteps, usePersistentReducer, storageKey, storageDebounceMS, , reducer, initialState,] = args;

  const timeline: Timeline<S> = {
    past: [],
    present: initialState,
    future: [],
  };

  const proxiedReducer = (tl: Timeline<S>, action: A | TimeTravelAction): Timeline<S> => {
    switch (action.type) {
      case UNDO_ACTION_TYPE:
        return _doUndo(tl);
      case REDO_ACTION_TYPE:
        return _doRedo(tl);
      case RESET_ACTION_TYPE:
        return _doReset(tl);
      default:
        const newState = produce(tl.present, (draft) => reducer(draft as S, action as A) as Draft<S>);
        return _addNewPresent(tl, newState, maxHistorySteps);
    }
  };

  const [_timeline, _dispatch, _initialized] = usePersistentReducer(
    storageKey, storageDebounceMS, undefined, proxiedReducer, timeline, null);

  return {
    state: _timeline.present,
    timeline: _timeline,
    dispatch: _dispatch,
    undo: () => _dispatch({ type: UNDO_ACTION_TYPE }),
    redo: () => _dispatch({ type: REDO_ACTION_TYPE }),
    reset: () => _dispatch({ type: RESET_ACTION_TYPE }),
    initialized: _initialized,
  };
}

function _addNewPresent<S>(timeline: Timeline<S>, newPresent: S, maxHistoryEntries: number) {
  return produce(timeline, draft => {
    draft.past.push(draft.present);
    // TODO: apply maxHistoryEntries constraint here
    draft.present = newPresent as Draft<S>;
    draft.future = [];
  });
}

function _doUndo<S>(timeline: Timeline<S>) {
  return produce(timeline, draft => {
    if (!draft.past.length)
      return;
    const newPresent = draft.past.pop() as Draft<S>;
    // TODO: validate restored past; abort and wipe further past if invalid.
    draft.future.unshift(draft.present);
    draft.present = newPresent;
  });
}

function _doRedo<S>(timeline: Timeline<S>) {
  return produce(timeline, draft => {
    if (!draft.future.length)
      return;
    const newPresent = draft.future.shift();
    draft.past.push(draft.present);
    draft.present = newPresent as Draft<S>;
  });
}

function _doReset<S>(timeline: Timeline<S>) {
  return produce(timeline, draft => {
    if (!draft.past.length)
      return;
    const newPresent = draft.past.shift();
    draft.future = [...draft.past, draft.present, ...draft.future];
    draft.present = newPresent as Draft<S>;
    draft.past = [];
  });
}

export default useTimeTravelingPersistentStateReducer;


export const initialHook: TimeTravelingPersistentStateReducerHook<any, any> = () => ({
  timeline: { present: {}, future: [], past: [] },
  state: {},
  dispatch: () => ({}),
  undo: () => void 0,
  redo: () => void 0,
  reset: () => void 0,
  initialized: false,
});
