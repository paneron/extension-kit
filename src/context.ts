import React from 'react';
import { ExtensionContext, ValueHook } from './types';


export interface ExtensionViewContextSpec extends ExtensionContext {}


function getValueHookPlaceholder<T>(value: T): () => ValueHook<T> {
  return () => ({
    value,
    errors: [],
    isUpdating: false,
    _reqCounter: -1,
    refresh: () => {},
  });
}

const INITIAL_CONTEXT: ExtensionViewContextSpec = {
  title: '',

  useAuthorEmail: getValueHookPlaceholder({ email: '' }),
  useRemoteUsername: getValueHookPlaceholder({ username: '' }),
  useObjectPaths: getValueHookPlaceholder([]),
  useObjectSyncStatus: getValueHookPlaceholder({}),
  useObjectData: getValueHookPlaceholder({}),

  requestFileFromFilesystem: async () => ({}),

  changeObjects: async () => ({}),
  useObjectsChangedEvent: () => {},

  makeRandomID: async () => '',
  makeAbsolutePath: () => '',
}


export const ExtensionViewContext = React.createContext<ExtensionViewContextSpec>(INITIAL_CONTEXT);
