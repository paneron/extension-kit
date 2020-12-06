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

  useObjectPaths: getValueHookPlaceholder([]),
  useObjectSyncStatus: getValueHookPlaceholder({}),
  useObjectData: getValueHookPlaceholder({}),
  useObjectsChangedEvent: () => {},

  requestFileFromFilesystem: async () => ({}),

  changeObjects: async () => ({}),

  makeRandomID: async () => '',

  //useAuthorEmail: getValueHookPlaceholder({ email: '' }),
  //useRemoteUsername: getValueHookPlaceholder({ username: '' }),
  //makeAbsolutePath: () => '',
}


export const DatasetContext = React.createContext<DatasetContextSpec>(INITIAL_CONTEXT);


