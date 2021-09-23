//import type { FileFilter } from 'electron';
export interface FileFilter {
  extensions: string[];
  name: string;
}

import { ObjectDataset, ObjectChangeset } from './objects';
import { BufferDataset } from './buffers';
import { CommitOutcome, ChangeStatus } from './changes';
import { IndexStatus } from './indexes';
import { BaseAction, PersistentStateReducerHook } from '../usePersistentStateReducer';
import { TimeTravelingPersistentStateReducerHook } from '../useTimeTravelingPersistentStateReducer';
import { Settings, GlobalSettings } from '../settings';
import { OpenFileDialogProps, SaveFileDialogProps } from './dialogs';


export interface DatasetContext {
  title: string

  logger: { log: Console["log"], error: Console["error"], debug: Console["debug"] }

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

  /** Provides an isBusy flag and informs user of operation outcome using a “toaster” widget */
  performOperation: <P extends any[], R>(gerund: string, func: (...opts: P) => Promise<R>) => (...opts: P ) => Promise<R>
  operationKey?: string

  /**
   * Provides access to remote username, as configured in Paneron settings.
   * NOTE: Dataset extension *could* use it to infer author’s role by comparing with some list.
   * However, this is not a security measure and must be used for sensitive access control
   * in place of Git server-level authentication.
   * It can be used for informative purposes to show role-appropriate GUIs
   * to already trusted users who will abide
   * despite technically being able to sidestep the comparison.
   */
  useRemoteUsername: RemoteUsernameHook

  // Paneron internal clipboard (provisional)
  copyObjects: (objects: ObjectDataset) => Promise<void>
  requestCopiedObjects: () => Promise<ObjectDataset>

  // Settings

  useGlobalSettings: Hooks.Settings.UseGlobalSettings
  useSettings: Hooks.Settings.UseSettings
  updateSetting: Hooks.Settings.UpdateSetting

  //useObjectChangeStatus: ObjectChangeStatusHook

  /** TODO: Provisional; for the new extension architecture */
  getObjectView:
    (opts: { objectPath: string, viewID?: string }) =>
      React.FC<DatasetContext & { objectPath: string, className?: string }>

  /**
   * Provides a full system-absolute path to a path given relative to dataset root,
   * which is useful in rare cases.
   */
  makeAbsolutePath: (path: string) => string

  /**
   * This may be useful in rare cases with poorly-integrated third-party libraries.
   * Only works for dependencies with corresponding unpackAsar entries
   * in Paneron’s electron-builder config.
   */
  getRuntimeNodeModulePath?: (moduleName: string) => string

  /** Tools for working with blob/buffer array conversion */
  useDecodedBlob: Hooks.UseDecodedBlob
  getBlob?: (fromStringValue: string) => Promise<Uint8Array>


  // Below are generally useful for write-enabled repositories only:

  /** Generates a UUID (not really useful in read-only mode so may be made optional) */
  makeRandomID?: () => Promise<string>

  /** 
   * Commits changes to the dataset on per-object level.
   */
  updateObjects?: Hooks.Data.UpdateObjects

  /** 
   * Manipulates repository data (within the dataset) on subtree level (delete or move subtree).
   */
  updateTree?: Hooks.Data.UpdateObjectTree


  // Tools for working with local filesystem

  /**
   * Invokes file selection dialog and returns file data as buffer when user confirms.
   * This does not mutate dataset / Git repo contents, changeObjects still
   * must be invoked later in order to commit newly added or replaced file.
   */ 
  requestFileFromFilesystem?: (opts: OpenFileDialogProps, cb?: (data: BufferDataset) => void) => Promise<BufferDataset>

  /** Invokes file save dialog, writes provided buffer data to chosen file path and returns that path. */
  writeFileToFilesystem?:
    (opts: { dialogOpts: SaveFileDialogProps, bufferData: Uint8Array }) =>
      Promise<{ success: true, savedToFileAtPath: string }>

  // Provisional, probably won’t happen:
  // Invokes file selection dialog,
  // adds selected file(s) to the repository at given location,
  // prompts the user to commit changes to the repository,
  // returns commit outcome.
  // addFileFromFilesystem?: (opts: OpenDialogProps, commitMessage: string, targetPath: string) => Promise<CommitOutcome & { addedObjects: ObjectDataset }>
}


export interface ValueHook<T> {
  value: T
  errors: string[]
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

  export namespace Settings {
    export type UseGlobalSettings =
      () => ValueHook<{ settings: GlobalSettings }>

    export type UseSettings =
      () => ValueHook<{ settings: Settings }>

    export type UpdateSetting =
      (opts: { key: string, value: any }) => Promise<{ success: true }>
  }

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
      commitMessage: string
      /** Disables the checks against oldValue keys in the changeset */
      _dangerouslySkipValidation?: true 
    }) => Promise<CommitOutcome>

    /** Operates ona a tree of objects within a dataset. Does not do integrity checks. Dangerous. */
    export type UpdateObjectTree = (opts: {
      subtreeRoot: string
      newSubtreeRoot: string | null
      commitMessage: string
    }) => Promise<CommitOutcome>

    export type ListenToObjectChanges = (
      eventCallback:
        (evt: { objects?: { [objectPath: string]: ChangeStatus | true } }) =>
          Promise<void>,
      args: any[],
    ) => void

  }

}



//export type AuthorEmailHook = () => ValueHook<{ email: string }>
export type RemoteUsernameHook = () => ValueHook<{ username?: string }>



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
