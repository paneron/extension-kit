import React from 'react';
import {
  DatasetContext as DatasetContextSpec,
  ReadOnlyDatasetContext as ReadOnlyDatasetContextSpec,
  ValueHook,
} from './types';


function getValueHookPlaceholder<T>(value: T): () => ValueHook<T> {
  return () => ({
    value,
    errors: [],
    isUpdating: false,
    _reqCounter: -1,
    refresh: () => {},
  });
}

const READ_ONLY_INITIAL_CONTEXT: ReadOnlyDatasetContextSpec = {
  title: '',

  useObjectData: getValueHookPlaceholder({}),

  useIndexDescription: getValueHookPlaceholder({
    status: {
      objectCount: 0,
      progress: {
        phase: 'initializing',
        total: 0,
        loaded: 0,
      },
    },
  }),

  useFilteredIndex: getValueHookPlaceholder({
    indexID: '',
  }),

  useObjectPathFromFilteredIndex: getValueHookPlaceholder({
    objectPath: '',
  }),

  getObjectView: (opts: { objectPath: string }) =>
    () => <>{opts.objectPath}</>,

  requestFileFromFilesystem: async () => ({}),

  //useAuthorEmail: getValueHookPlaceholder({ email: '' }),
  //useRemoteUsername: getValueHookPlaceholder({ username: '' }),

  makeAbsolutePath: () => '',

} as const;


const INITIAL_CONTEXT: DatasetContextSpec = {
  ...READ_ONLY_INITIAL_CONTEXT,

  updateObjects: async () => ({}),
  makeRandomID: async () => '',
} as const;


export const DatasetContext =
  React.createContext<DatasetContextSpec>(INITIAL_CONTEXT);

export const ReadOnlyDatasetContext =
  React.createContext<ReadOnlyDatasetContextSpec>(INITIAL_CONTEXT);


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



/* Like withDatasetContext(), but uses read-only dataset context. */
export function withReadOnlyDatasetContext(Component: React.FC<any>):
React.FC<ReadOnlyDatasetContextSpec> {
  return (props: ReadOnlyDatasetContextSpec) => (
    <ReadOnlyDatasetContext.Provider value={props}>
      <Component />
    </ReadOnlyDatasetContext.Provider>
  );
}
