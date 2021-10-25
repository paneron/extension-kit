import log from 'electron-log';
import React from 'react';
import { INITIAL_GLOBAL_SETTINGS } from './settings';
import {
  DatasetContext as DatasetContextSpec,
  ValueHook,
} from './types';
import { INITIAL_INDEX_STATUS } from './types/indexes';
import { initialHook as initialPersistentStateReducerHook } from './usePersistentStateReducer';
import { initialHook as initialTimeTravelingPersistentStateReducerHook } from './useTimeTravelingPersistentStateReducer';
import { GlobalSettingsContext } from './SettingsContext';


function getValueHookPlaceholder<T>(value: T): () => ValueHook<T> {
  return () => ({
    value,
    errors: [],
    isUpdating: false,
    _reqCounter: -1,
    refresh: () => {},
  });
}


const INITIAL_CONTEXT: DatasetContextSpec = {
  title: '',

  performOperation: (_, f) => f,

  requestCopiedObjects: async () => ({}),

  useObjectData: getValueHookPlaceholder({
    data: {},
  }),

  logger: log,

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

  usePersistentDatasetStateReducer: initialPersistentStateReducerHook,
  useTimeTravelingPersistentDatasetStateReducer: initialTimeTravelingPersistentStateReducerHook,

  copyObjects: async () => void 0,

  //usePersistentDatasetStateReducer: () => [{}, () => {}, false] as [any, () => any, boolean],

  getObjectView: (opts: { objectPath: string }) =>
    () => <>{opts.objectPath}</>,

  requestFileFromFilesystem: async () => ({}),

  makeAbsolutePath: () => '',

  useSettings: getValueHookPlaceholder({ settings: {} }),

  useGlobalSettings: getValueHookPlaceholder({ settings: INITIAL_GLOBAL_SETTINGS }),

  updateSetting: async () => ({ success: true as true }),

} as const;


/* A higher-order component that:

   - takes dataset view component;
   - returns a component that takes dataset context as props,
     and renders dataset view wrapped inside dataset context provider. */
export function withDatasetContext(Component: React.FC<any>):
React.FC<DatasetContextSpec> {
  return (props: DatasetContextSpec) => {
    const settings = props.useGlobalSettings();
    return (
      <DatasetContext.Provider value={props}>
        <GlobalSettingsContext.Provider value={{ settings: settings.value.settings, refresh: settings.refresh }}>
          <Component />
        </GlobalSettingsContext.Provider>
      </DatasetContext.Provider>
    );
  };
}


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
