import React from 'react';
import { DatasetContext as DatasetContextSpec, ValueHook } from './types';


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

  useRawObjectsChangedEvent: () => {},

  useRawObjectPaths: getValueHookPlaceholder([]),
  useRawObjectSyncStatus: getValueHookPlaceholder({}),
  useRawObjectData: getValueHookPlaceholder({}),
  useObjectData: getValueHookPlaceholder({ data: {} }),
  useObjectPaths: getValueHookPlaceholder({ objectPaths: [] }),

  requestFileFromFilesystem: async () => ({}),

  changeObjects: async () => ({}),

  makeRandomID: async () => '',

  //useAuthorEmail: getValueHookPlaceholder({ email: '' }),
  //useRemoteUsername: getValueHookPlaceholder({ username: '' }),

  makeAbsolutePath: () => '',
}


export const DatasetContext = React.createContext<DatasetContextSpec>(INITIAL_CONTEXT);


/* A higher-order component that:

   - takes dataset view component that takes no props;
   - returns a component that takes dataset context as props,
     and renders dataset view wrapped inside dataset context provider. */
export function withDatasetContext(Component: React.FC<Record<never, never>>):
React.FC<DatasetContextSpec> {
  return (props: DatasetContextSpec) => (
    <DatasetContext.Provider value={props}>
      <Component />
    </DatasetContext.Provider>
  );
}
