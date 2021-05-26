import React from 'react';
import {
  DatasetContext as DatasetContextSpec,
  ValueHook,
} from './types';
import { INITIAL_INDEX_STATUS } from './types/indexes';


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

  copyObjects: async () => void 0,

  requestCopiedObjects: async () => ({}),

  useObjectData: getValueHookPlaceholder({
    data: {},
  }),

  getObjectData: async () => ({ data: {} }),
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

  //usePersistentDatasetStateReducer: () => [{}, () => {}, false] as [any, () => any, boolean],

  getObjectView: (opts: { objectPath: string }) =>
    () => <>{opts.objectPath}</>,

  requestFileFromFilesystem: async () => ({}),

  makeAbsolutePath: () => '',

} as const;


/* A higher-order component that:

   - takes dataset view component;
   - returns a component that takes dataset context as props,
     and renders dataset view wrapped inside dataset context provider. */
export function withDatasetContext(Component: React.FC<any>):
React.FC<DatasetContextSpec> {
  return (props: DatasetContextSpec) => (
    <DatasetContext.Provider value={props}>
      <Component />
    </DatasetContext.Provider>
  );
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
