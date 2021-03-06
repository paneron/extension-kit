//import type { FileFilter } from 'electron';
interface FileFilter {
  extensions: string[];
  name: string;
}

import { ObjectDataset, ObjectChangeset } from './objects';
import { BufferDataset } from './buffers';
import { CommitOutcome, ChangeStatus } from './changes';
import { IndexStatus } from './indexes';
import { BaseAction, PersistentStateReducerHook } from '../usePersistentStateReducer';
import { TimeTravelingPersistentStateReducerHook } from '../useTimeTravelingPersistentStateReducer';


export interface DatasetContext {
  title: string

  // Below functions, when take or return object paths, use dataset-relative paths
  // and convert them to and from repo-relative paths under the hood as needed.

  useObjectData: Hooks.Data.GetObjectDataset
  getObjectData: (opts: ObjectDatasetRequest) => Promise<ObjectDatasetResponse>

  useIndexDescription: Hooks.Indexes.Describe
  useFilteredIndex: Hooks.Indexes.GetOrCreateFiltered

  useObjectPathFromFilteredIndex: Hooks.Indexes.GetFilteredObject
  getObjectPathFromFilteredIndex: (opts: FilteredObjectPathRequest) =>
    Promise<FilteredObjectPathResponse>

  useFilteredIndexPosition: Hooks.Indexes.GetFilteredObjectIndexPosition
  getFilteredIndexPosition: (opts: FilteredObjectIndexPositionRequest) =>
    Promise<FilteredObjectIndexPositionResponse>

  usePersistentDatasetStateReducer: Hooks.UsePersistentDatasetStateReducer<any, any>
  useTimeTravelingPersistentDatasetStateReducer: Hooks.UseTimeTravelingPersistentDatasetStateReducer<any, any>

  // Paneron internal clipboard
  copyObjects: (objects: ObjectDataset) => Promise<void>
  requestCopiedObjects: () => Promise<ObjectDataset>

  //useObjectChangeStatus: ObjectChangeStatusHook

  getObjectView:
    (opts: { objectPath: string, viewID?: string }) =>
      React.FC<DatasetContext & { objectPath: string, className?: string }>

  // Provides a full system-absolute path to given path relative to dataset,
  // which is useful in rare cases.
  makeAbsolutePath: (path: string) => string

  // This may be useful in rare cases with poorly-integrated third-party libraries.
  // Only works for dependencies with corresponding unpackAsar entries
  // in Paneron’s electron-builder config.
  getRuntimeNodeModulePath?: (moduleName: string) => string

  // Invokes file selection dialog,
  // adds selected file(s) to the repository at given location,
  // prompts the user to commit changes to the repository,
  // returns commit outcome.
  // Provisional, probably won’t happen
  // onAddFile?: (opts: OpenDialogProps, commitMessage: string, targetPath: string) => Promise<CommitOutcome & { addedObjects: ObjectDataset }>

  // Tools for working with buffer array conversion
  useDecodedBlob: Hooks.UseDecodedBlob
  getBlob?: (fromStringValue: string) => Promise<Uint8Array>


  // Below are generally useful for write-enabled repositories only

  // Generates a UUID (not really useful in read-only mode so may be made optional)
  makeRandomID?: () => Promise<string>

  // Prompts the user to commit changes to the repository.
  // User can review and change the commit message.
  updateObjects?: Hooks.Data.UpdateObjects


  // Tools for working with local filesystem

  // Invokes file selection dialog and returns file data as buffer when user confirms.
  // This does not mutate dataset / Git repo contents, changeObjects still
  // must be invoked later in order to commit newly added or replaced file.
  requestFileFromFilesystem?: (opts: OpenDialogProps) => Promise<BufferDataset>

  // Invokes file save dialog, writes provided buffer data to chosen file path and returns that path.
  writeFileToFilesystem?:
    (opts: { dialogOpts: SaveDialogProps, bufferData: Uint8Array }) =>
      Promise<{ success: true, savedToFileAtPath: string }>
}


// export type ReadOnlyDatasetContext =
//   Omit<DatasetContext, 'updateObjects' | 'makeRandomID'>;


export interface OpenDialogProps {
  prompt: string
  filters?: FileFilter[]
  allowMultiple?: boolean
}

export interface SaveDialogProps {
  prompt: string
  filters?: FileFilter[]
}

export interface ValueHook<T> {
  value: T
  errors: Error[]
  isUpdating: boolean
  refresh: () => void
  _reqCounter: number
}


export type FilteredObjectPathRequest = { indexID: string, position: number };
export type FilteredObjectPathResponse = { objectPath: string /* empty string is a special case. */};

export type FilteredObjectIndexPositionRequest = { indexID: string, objectPath: string };
export type FilteredObjectIndexPositionResponse = { position: number | null };

export type ObjectDatasetRequest = { objectPaths: string[] };
export type ObjectDatasetResponse = { data: ObjectDataset };


export namespace Hooks {

  export type UseDecodedBlob =
    (opts: { blob: Uint8Array }) =>
      { asString: string }

  export type UsePersistentDatasetStateReducer<S, A extends BaseAction> = PersistentStateReducerHook<S, A>
  export type UseTimeTravelingPersistentDatasetStateReducer<S, A extends BaseAction> = TimeTravelingPersistentStateReducerHook<S, A>

  export namespace Indexes {

    export type Describe =
      (opts: { indexID?: string }) =>
        ValueHook<{ status: IndexStatus }>

    export type GetOrCreateFiltered =
      (opts: { queryExpression: string, keyExpression?: string }) =>
        ValueHook<{ indexID: string | undefined }>;

    export type GetFilteredObject =
      (opts: FilteredObjectPathRequest) =>
        ValueHook<FilteredObjectPathResponse>

    export type GetFilteredObjectIndexPosition =
      (opts: FilteredObjectIndexPositionRequest) =>
        ValueHook<FilteredObjectIndexPositionResponse>

    export type ListenToFilteredIndexUpdates = (
      eventCallback:
        (evt: { indexID: string }) =>
          Promise<void>,
      args: any[],
    ) => void

    export type ListenToIndexStatusChanges = (
      eventCallback:
        (evt: { indexID?: string, status: IndexStatus }) =>
          Promise<void>,
      args: any[],
    ) => void

  }

  export namespace Data {

    export type GetObjectDataset =
      (opts: ObjectDatasetRequest) =>
        ValueHook<ObjectDatasetResponse>

    export type UpdateObjects = (opts: {
      objectChangeset: ObjectChangeset
      commitMessage: string // If not provided, Paneron would prompt the user
      _dangerouslySkipValidation?: true // Disables the checks against oldValue keys in the changeset
    }) => Promise<CommitOutcome>

    export type ListenToObjectChanges = (
      eventCallback:
        (evt: { objects?: { [objectPath: string]: ChangeStatus | true } }) =>
          Promise<void>,
      args: any[],
    ) => void

  }

}



//export type RemoteUsernameHook = () => ValueHook<{ username?: string }>
//export type AuthorEmailHook = () => ValueHook<{ email: string }>



//export interface WriteableDatasetContext extends DatasetContext {
//  writeable: true
//
//
//  // Obsolete
//
//  //makeAbsolutePath: (path: string) => string
//
//  // Was used primarily by registry kit to check whether user is manager;
//  // now non-managers should not be given access at Git repository level.
//  //useAuthorEmail: AuthorEmailHook
//  //useRemoteUsername: RemoteUsernameHook
//}
