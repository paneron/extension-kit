import React, { memo, useMemo } from 'react';
import { INITIAL_GLOBAL_SETTINGS } from './settings';
import type {
  DatasetContext as DatasetContextSpec,
  ValueHook,
} from './types';
import { INITIAL_INDEX_STATUS } from './types/indexes';
import { initialHook as initialPersistentStateReducerHook } from './usePersistentStateReducer';
import { initialHook as initialTimeTravelingPersistentStateReducerHook } from './useTimeTravelingPersistentStateReducer';
import { GlobalSettingsContext } from './SettingsContext';
import { INITIAL_CONTEXT as INITIAL_OPERATION_CONTEXT } from './widgets/OperationQueue/context';


function getValueHookPlaceholder<T>(value: T): () => ValueHook<T> {
  return () => ({
    value,
    errors: [],
    isUpdating: false,
    _reqCounter: -1,
    refresh: () => {},
  });
}


function noOp() {}


const INITIAL_CONTEXT: DatasetContextSpec = {
  ...INITIAL_OPERATION_CONTEXT,

  title: '',

  logger: { log: noOp, error: noOp, debug: noOp },

  requestCopiedObjects: async () => ({}),

  useObjectData: getValueHookPlaceholder({
    data: {},
  }),

  openExternalLink: async () => void 0,

  getObjectData: async () => ({ data: {} }),

  useRemoteUsername: getValueHookPlaceholder({}),

  useDecodedBlob: () => ({
    asString: '',
  }),

  useIndexDescription: getValueHookPlaceholder({
    status: INITIAL_INDEX_STATUS,
  }),

  useFilteredIndex: getValueHookPlaceholder({
    indexID: '',
  }),

  useObjectPathFromFilteredIndex: getValueHookPlaceholder({
    objectPath: '',
  }),

  getObjectPathFromFilteredIndex: async () => ({ objectPath: '' }),

  useFilteredIndexPosition: getValueHookPlaceholder({
    position: null,
  }),

  getFilteredIndexPosition: async () => ({ position: null }),

  useMapReducedData: getValueHookPlaceholder({}) as DatasetContextSpec["useMapReducedData"],
  getMapReducedData: (async () => ({})) as DatasetContextSpec["getMapReducedData"],

  usePersistentDatasetStateReducer: initialPersistentStateReducerHook,
  useTimeTravelingPersistentDatasetStateReducer: initialTimeTravelingPersistentStateReducerHook,

  copyObjects: async () => void 0,

  //usePersistentDatasetStateReducer: () => [{}, () => {}, false] as [any, () => any, boolean],

  getObjectView: (opts: { objectPath: string }) =>
    () => <>{opts.objectPath}</>,

  requestFileFromFilesystem: async () => ({}),

  //makeAbsolutePath: () => '',

  useSettings: getValueHookPlaceholder({ settings: {} }),

  useGlobalSettings: getValueHookPlaceholder({ settings: INITIAL_GLOBAL_SETTINGS }),

  updateSetting: async () => ({ success: true as true }),

  listExporters: () => ({}),

} as const;


/**
 * A higher-order component that:
 *
 * - takes dataset view component;
 * - returns a component that takes dataset context as props,
 *   and renders dataset view wrapped inside dataset context provider.
 */
export function withDatasetContext(Component: React.FC<any>):
React.FC<DatasetContextSpec> {
  // TODO: Check again whether `withDatasetContext()` helper is needed.
  // Why can’t we wrap the entire view in DatasetContext.Provider
  // in Paneron and gain access to it normally?

  return memo(function extensionView(props: DatasetContextSpec) {
    const settings = props.useGlobalSettings();
    return (
      <DatasetContext.Provider value={props}>
        <GlobalSettingsContext.Provider
            value={useMemo(
              (() => ({ settings: settings.value.settings, refresh: settings.refresh })),
              [settings])}>
          <Component />
        </GlobalSettingsContext.Provider>
      </DatasetContext.Provider>
    );
  });
}


/**
 * Provides functions for interacting with dataset data,
 * and by extension the underlying repositories.
 * 
 * NOTE: If your IDE does not expose TSDoc docstrings for DatasetContext
 * members, consult DatasetContextSpec type definition.
 */
export const DatasetContext =
  React.createContext<DatasetContextSpec>(INITIAL_CONTEXT);


// export const ReadOnlyDatasetContext =
//   React.createContext<ReadOnlyDatasetContextSpec>(INITIAL_CONTEXT);

/* Like withDatasetContext(), but uses read-only dataset context. */
// export function withReadOnlyDatasetContext(Component: React.FC<any>):
// React.FC<ReadOnlyDatasetContextSpec> {
//   return (props: ReadOnlyDatasetContextSpec) => (
//     <ReadOnlyDatasetContext.Provider value={props}>
//       <Component />
//     </ReadOnlyDatasetContext.Provider>
//   );
// }
