import type { FileFilter } from 'electron';

import { ObjectDataset, ObjectChangeset } from './objects';
import { BufferDataset } from './buffers';
import { CommitOutcome, ChangeStatus } from './changes';
import { IndexStatus } from './indexes';


export interface DatasetContext {
  title: string

  // Below functions, when take or return object paths, use dataset-relative paths
  // and convert them to and from repo-relative paths under the hood as needed.

  useObjectData: Hooks.Data.GetObjectDataset
  useIndexDescription: Hooks.Indexes.Describe
  useFilteredIndex: Hooks.Indexes.GetOrCreateFiltered
  useObjectPathFromFilteredIndex: Hooks.Indexes.GetFilteredObject

  useDecodedBlob: Hooks.UseDecodedBlob

  // Paneron internal clipboard
  copyObjects: (objects: ObjectDataset) => Promise<void>
  requestCopiedObjects: () => Promise<ObjectDataset>

  //useObjectChangeStatus: ObjectChangeStatusHook

  getObjectView:
    (opts: { objectPath: string, viewID?: string }) =>
      React.FC<DatasetContext & { objectPath: string }>

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


  // Below are generally useful for write-enabled repositories only

  // Generates a UUID (not really useful in read-only mode so may be made optional)
  makeRandomID?: () => Promise<string>

  // Prompts the user to commit changes to the repository.
  // User can review and change the commit message.
  updateObjects?: Hooks.Data.UpdateObjects

  // Invokes file selection dialog and returns file data as buffer when user confirms.
  // This does not mutate dataset / Git repo contents, changeObjects still
  // must be invoked later in order to commit newly added or replaced file.
  requestFileFromFilesystem?: (opts: OpenDialogProps) => Promise<BufferDataset>
}


// export type ReadOnlyDatasetContext =
//   Omit<DatasetContext, 'updateObjects' | 'makeRandomID'>;


export interface OpenDialogProps {
  prompt: string
  filters?: FileFilter[]
  allowMultiple?: boolean
}

export interface ValueHook<T> {
  value: T
  errors: Error[]
  isUpdating: boolean
  refresh: () => void
  _reqCounter: number
}


export namespace Hooks {

  export type UseDecodedBlob =
    (opts: { blob: Uint8Array }) =>
      { asString: string }

  export namespace Indexes {

    export type Describe =
      (opts: { indexID?: string }) =>
        ValueHook<{ status: IndexStatus }>

    export type GetOrCreateFiltered =
      (opts: { queryExpression: string }) =>
        ValueHook<{ indexID: string | undefined }>;

    export type GetFilteredObject =
      (opts: { indexID: string, position: number }) =>
        ValueHook<{ objectPath: string }>

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
      (opts: { objectPaths: string[] }) =>
        ValueHook<{ data: ObjectDataset }>

    export type UpdateObjects = (opts: {
      objectChangeset: ObjectChangeset
      commitMessage: string
      _dangerouslySkipValidation?: true
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
