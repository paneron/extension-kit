/** @jsx jsx */

import React, { createContext, useContext, useEffect } from 'react';
import { jsx } from '@emotion/react';
import { DatasetContext } from '../../context';
import { PersistentStateReducerHook } from '../../usePersistentStateReducer';
import type { TabbedWorkspaceContext as TabbedWorkspaceContextSpec, Action, ProtocolRegistry, State } from './types';


const initialState: State<''> = {
  detailTabURIs: [],
  focusedTabIdx: 0,
  selectedSidebarID: '',
}


export const TabbedWorkspaceContext = createContext<TabbedWorkspaceContextSpec<any, any>>({
  spawnTab: () => void 0,
  closeTabWithURI: () => void 0,
  protocolConfiguration: {},
  state: initialState,
  dispatch: () => void 0,
});


export function makeContextProvider
<Proto extends string, SidebarID extends string>(
  initialSidebarID: SidebarID,
  sidebarIDs: readonly SidebarID[],
  protocolConfiguration: ProtocolRegistry<Proto>,
):
React.FC<TabbedWorkspaceContextProviderProps> {

  const initialState: State<SidebarID> = {
    detailTabURIs: [],
    focusedTabIdx: SPECIAL_TAB_IDX.new,
    selectedSidebarID: initialSidebarID,
  }

  function reducer(prevState: State<SidebarID>, action: Action<SidebarID>): State<SidebarID> {
    switch (action.type) {

      case 'focus-sidebar':
        return {
          ...prevState,
          selectedSidebarID: action.payload.id,
        };

      case 'spawn-tab': {
        const detailTabURIs = [ ...prevState.detailTabURIs ];
        const existingTabIdx = detailTabURIs.indexOf(action.payload.uri);
        if (existingTabIdx >= 0) {
          return {
            ...prevState,
            focusedTabIdx: existingTabIdx,
          };
        } else {
          const idxToInsertAt = prevState.focusedTabIdx >= 0
            ? prevState.focusedTabIdx + 1
            : 0;
          detailTabURIs.splice(idxToInsertAt, 0, action.payload.uri);
          return {
            ...prevState,
            detailTabURIs,
            focusedTabIdx: idxToInsertAt,
          };
        }
      }

      case 'focus-tab':
        return {
          ...prevState,
          focusedTabIdx: action.payload.idx,
        };

      case 'navigate-focused-tab':
        const existingTabIdx = prevState.detailTabURIs.indexOf(action.payload.uri);
        if (existingTabIdx >= 0) {
          return {
            ...prevState,
            focusedTabIdx: existingTabIdx,
          };
        } else if (prevState.detailTabURIs[prevState.focusedTabIdx]) {
          const detailTabURIs = [ ...prevState.detailTabURIs ];
          detailTabURIs[prevState.focusedTabIdx] = action.payload.uri;
          return {
            ...prevState,
            detailTabURIs,
          };
        } else {
          return prevState;
        }

      case 'close-tab': {
        const detailTabURIs = [ ...prevState.detailTabURIs ];
        const closedFocused = action.payload.idx === prevState.focusedTabIdx;

        detailTabURIs.splice(action.payload.idx, 1);

        const focusedTabIdx = closedFocused
          ? detailTabURIs.length > 0
            // If a focused tab is closed and there are any tabs left, switch to previous tab
            ? action.payload.idx > 0
              ? action.payload.idx - 1
              : 0
            : SPECIAL_TAB_IDX.new
          : prevState.focusedTabIdx > action.payload.idx
            // If a tab before focused tab is closed, adjust focused index to maintain tab selection
            ? prevState.focusedTabIdx - 1
            : prevState.focusedTabIdx;

        return {
          ...prevState,
          detailTabURIs,
          focusedTabIdx,
        };
      }

      // TODO: Reducer knows how to move tabs, but we want to hook up a nice drag-and-drop mechanism.
      case 'move-tab': {
        const detailTabURIs = [ ...prevState.detailTabURIs ];
        const tab = detailTabURIs.splice(action.payload.sourceIdx, 1)[0];
        if (tab) {
          detailTabURIs.splice(action.payload.destinationIdx, 0, tab);
        }
        return {
          ...prevState,
          detailTabURIs,
        };
      }

      default:
        throw new Error("Invalid action");
    }
  }

  function validateState(state: Partial<State<any>>): state is State<any> {
    return (
      state.detailTabURIs?.map !== undefined &&
      typeof state.selectedSidebarID === 'string' &&
      sidebarIDs.indexOf(state.selectedSidebarID as any) >= 0
    );
  }

  const TabbedWorkspaceContextProvider:
  React.FC<TabbedWorkspaceContextProviderProps> =
  function ({ stateKey, onFocusedTabChange, children }) {

    const { usePersistentDatasetStateReducer } = useContext(DatasetContext);

    const [ state, dispatch ] =
    (usePersistentDatasetStateReducer as PersistentStateReducerHook<State<SidebarID>, Action<SidebarID>>)(
      stateKey,
      undefined,
      validateState,
      reducer,
      initialState,
      null);

    const focusedTabURI: string | undefined =
      state.focusedTabIdx >= 0
        ? state.detailTabURIs[state.focusedTabIdx]
        : undefined;

    useEffect(() => {
      if (onFocusedTabChange) {
        onFocusedTabChange(focusedTabURI);
      }
    }, [focusedTabURI]);

    const ctx: TabbedWorkspaceContextSpec<Proto, SidebarID> = {
      spawnTab: uri => dispatch({ type: 'spawn-tab', payload: { uri } }),

      closeTabWithURI: uri => {
        const idx = state.detailTabURIs.indexOf(uri);
        if (idx >= 0) { dispatch({ type: 'close-tab', payload: { idx } }); }
      },

      navigateFocusedTab: uri => dispatch({ type: 'navigate-focused-tab', payload: { uri }}),
      protocolConfiguration,
      focusedTabURI,
      state,
      dispatch,
    };

    return (
      <TabbedWorkspaceContext.Provider value={ctx}>
        {children}
      </TabbedWorkspaceContext.Provider>
    );

  };

  return TabbedWorkspaceContextProvider;
}


export interface TabbedWorkspaceContextProviderProps {
  stateKey: string
  onFocusedTabChange?: (newFocusedTabURI: string | undefined) => void
}


export const SPECIAL_TAB_IDX: Record<'new', number> = {
  new: -2,
};
