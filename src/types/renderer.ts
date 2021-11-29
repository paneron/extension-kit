//import type { FileFilter } from 'electron';
export interface FileFilter {
  extensions: string[];
  name: string;
}

import { ObjectDataset, ObjectChangeset } from './objects';
import { CommitOutcome, ChangeStatus } from './changes';
import { IndexStatus } from './indexes';
import { BaseAction, PersistentStateReducerHook } from '../usePersistentStateReducer';
import { TimeTravelingPersistentStateReducerHook } from '../useTimeTravelingPersistentStateReducer';
import { Settings, GlobalSettings } from '../settings';
import { OpenFileDialogProps, SaveFileDialogProps } from './dialogs';
import { SubprocessDescription } from './binary-invocation';
import { ObjectSpecViewID, ObjectViewProps } from './object-spec';


export interface DatasetContext {
  title: string

  logger: { log: Console["log"], error: Console["error"], debug: Console["debug"] }

  /** Launches specified URI in OS’s default browser. */
  openExternalLink: (opts: { uri: string }) => Promise<void>

  // Below functions, when take or return object paths, use dataset-relative paths
  // and convert them to and from repo-relative paths under the hood as needed.

  /** Retrieves object data, and does its best to auto-refresh hook value if objects change. */
  useObjectData: Hooks.Data.GetObjectDataset

  /**
   * Retrieves object data, as a simple async function.
   * Generally it’s recommended to use the `useObjectData` hook instead.
   *
   * Request parameters are the same as to the hook.
   */
  getObjectData: (opts: ObjectDatasetRequest) => Promise<ObjectDatasetResponse>

  /**
   * Builds (or reuses) custom dataset index for high-performance windowed data access.
   *
   * Filtered indexes work around *query expressions*.
   * A query expression is a small predicate function that returns true or false for each object
   * in the dataset; objects for which true is returned are included in the filtered index.
   *
   * Whenever dataset contents change,
   * Paneron calculates (using query expression)
   * which filtered object indexes were affected by the change,
   * performs relevant updates on those indexes
   * and issues events triggering requisite hook refreshes & dependent GUI updates.
   *
   * NOTE: In some cases Paneron may fail to react to underlying object change,
   * resulting in stale indexes. In such cases, the user can refresh indexes.
   *
   * This hook will not unnecessarily create filtered index
   * if it already exists for given query expression.
   *
   * This hook returns filtered object index ID,
   * which is intended to be used for further calls:
   *
   * - Filtered index status can be obtained using `useIndexDescription()`.
   *
   * - Filtered object paths can be subsequently obtained
   *   via `useObjectPathFromFilteredIndex()`,
   *   which in turn can be passed to `useObjectData()`
   *   in order to obtain actual deserialized obejct data.
   */
  useFilteredIndex: Hooks.Indexes.GetOrCreateFiltered

  /** Describes a filtered object index: provides indexing status and object count. */
  useIndexDescription: Hooks.Indexes.Describe

  /**
   * Retrieve an object from a filtered index by its position in the index.
   * Used for efficient data windowing.
   */
  useObjectPathFromFilteredIndex: Hooks.Indexes.GetFilteredObject

  /** Non-hook equivalent of `useObjectPathFromFilteredIndex()` as plain async function. */
  getObjectPathFromFilteredIndex: (opts: FilteredObjectPathRequest) =>
    Promise<FilteredObjectPathResponse>

  /**
   * Given object path, retrieve its position in given filtered object index.
   * NOTE: The primary use case of this hook is workaround-ish, so it may be deprecated in future.
   */
  useFilteredIndexPosition: Hooks.Indexes.GetFilteredObjectIndexPosition

  /** Non-hook equivalent of `useFilteredIndexPosition()` as plain async function. */
  getFilteredIndexPosition: (opts: FilteredObjectIndexPositionRequest) =>
    Promise<FilteredObjectIndexPositionResponse>

  // TODO: Document state reducer hooks available to extensions.

  usePersistentDatasetStateReducer: Hooks.UsePersistentDatasetStateReducer<any, any>
  useTimeTravelingPersistentDatasetStateReducer: Hooks.UseTimeTravelingPersistentDatasetStateReducer<any, any>

  /**
   * Invokes the bundled Metanorma binary with given arguments, and returns subprocess description.
   *
   * For ongoing monitoring of invocation status, use `useMetanormaInvocationStatus()`.
   *
   * NOTE: It may be available even if Metanorma binary does not exist, in which case invocation will throw an error.
   */
  invokeMetanorma?: (opts: { cliArgs: string[] }) => Promise<SubprocessDescription>

  /**
   * Query Metanorma subprocess execution status.
   *
   * - Will return null if Metanorma subprocess cannot be found.
   *
   * - Will auto-refresh returned subprocess description.
   */
  useMetanormaInvocationStatus?: () => ValueHook<SubprocessDescription | null>

  /** Provides an isBusy flag and informs user of operation outcome using a “toaster” widget. */
  performOperation: <P extends any[], R>(gerund: string, func: (...opts: P) => Promise<R>) => (...opts: P ) => Promise<R>

  operationKey?: string

  /**
   * Provides access to remote username, as configured in Paneron settings.
   *
   * NOTE: Dataset extension *could* use it to infer author’s role by comparing with some list.
   * However, this is not a security measure and must be used for sensitive access control
   * in place of Git server-level authentication.
   *
   * This hook can be used for informative purposes to show role-appropriate GUIs
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
    (opts: { objectPath: string, viewID: ObjectSpecViewID }) =>
      React.FC<ObjectViewProps> | undefined

  /**
   * Provides a full system-absolute path to a path given relative to dataset root,
   * which is useful in rare cases.
   * 
   * NOTE: Does not resolve LFS references. If target object path is an LFS pointer,
   * the returned absolute path will also to the LFS pointer file.
   */
  makeAbsolutePath: (path: string) => string

  // /**
  //  * Provides a full system-absolute path to a path given relative to dataset root;
  //  * if referenced object is an LFS pointer, returns path to LFS blob in Git cache.
  //  */
  // useAbsolutePath: (opts: { objectPath: string, resolveLFS?: true }) => Promise<string>

  /**
   * This may be useful in rare cases with poorly-integrated third-party libraries.
   *
   * NOTE: only works for dependencies with corresponding `unpackAsar` entries
   * in Paneron’s electron-builder config.
   */
  getRuntimeNodeModulePath?: (moduleName: string) => string

  /** Returns a string value obtained from a binary blob given as Uint8Array. */
  useDecodedBlob: Hooks.UseDecodedBlob

  /** Given a string, will return a binary blob as Uint8Array. */
  getBlob?: (fromStringValue: string) => Promise<Uint8Array>


  // Below are generally useful for write-enabled repositories only:

  /** Generates a UUID (not really useful in read-only mode, so is optional) */
  makeRandomID?: () => Promise<string>

  /** 
   * Commits changes to the dataset on per-object level.
   */
  updateObjects?: Hooks.Data.UpdateObjects

  /** 
   * Manipulates repository data (within the dataset) on subtree level (delete or move subtree).
   *
   * NOTE: Does not do integrity checks. Dangerous.
   */
  updateTree?: Hooks.Data.UpdateObjectTree


  // Tools for working with local filesystem

  /**
   * Invokes file selection dialog and returns file data as buffer when user confirms.
   * This does not mutate dataset / Git repo contents, changeObjects still
   * must be invoked later in order to commit newly added or replaced file.
   */ 
  requestFileFromFilesystem?: (opts: OpenFileDialogProps, cb?: (data: ObjectDataset) => void) => Promise<ObjectDataset>

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


export type FilteredObjectPathRequest = {
  /**
   * The ID of the filtered object index from which the object is requested.
   * Index ID is returned by `useFilteredIndex()` hook.
   */
  indexID: string

  /**
   * Numerical position of object path in this index.
   *
   * Filter description hook will return the total number of objects in this index,
   * and that can be used as the upper bound for position.
   */
  position: number
};

export type FilteredObjectPathResponse = {
  /**
   * Object path at requested position in the index.
   * This path can be passed to, e.g., `useObjectData()` to obtain actual deserialized object.
   *
   * NOTE: there are some edge cases where objectPath can be empty, and those need to be documented.
   * However, `useObjectData()` will not cause a loud error if an empty path is passed.
   */
  objectPath: string
};

export type FilteredObjectIndexPositionRequest = {
  /** The ID of the filtered object index from which object position is requested. */
  indexID: string

  /** Object path, for which position is requested. */
  objectPath: string
};

export type FilteredObjectIndexPositionResponse = {
  /**
   * Position of given object in the index.
   * Can be null if object path was not found in the index.
   */
  position: number | null
};

export type ObjectDatasetRequest = {
  /** A list of dataset-relative object paths to fetch. */
  objectPaths: string[]

  /**
   * Whether or not to resolve large file storage.
   *
   * If true, and an LFS pointer is encountered, will attempt to download the full blob
   * if it was not cached yet. This may take some time.
   *
   * A failed download will cause an error to be thrown.
   */
  resolveLFS?: true
};
export type ObjectDatasetResponse = {
  /**
   * A map of requested object paths to deserialized object data, except:
   *
   * - If no object data could be retrieved for given object path,
   *   object path will be mapped to `null`.
   *
   * - If `resolveLFS` was not set,
   *   objects that are pointers to LFS will be returned as is
   *   (they will not contain the actual deserialized object data).
  */
  data: ObjectDataset
};




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
      (opts: {
        /** Filtered object index ID. Is returned by `useFilteredIndex()`. */
        indexID?: string
      }) => ValueHook<{ status: IndexStatus }>

    export type GetOrCreateFiltered =
      (opts: {
        /**
         * Query expression for the index.
         *
         * This must be a string containing a valid function definition.
         * The function will be constructed from this definition once,
         * and invoked against every object in default index.
         * 
         * The function must return either true or false. Objects for which
         * `queryExpression` returns true will be included in this index.
         *
         * The function will receive two positional arguments, called:
         * 1. `objPath` (dataset-relative path to the object, including file extension if any)
         * 2. `obj` (deserialized object data, as a JavaScript object)
         *
         * Thus, the function can do simple tests against object path,
         * like returning all objects that end with index.yaml and are in some subdirectory:
         * 
         *     `return objPath.startsWith('/some/subdirectory/') && objPath.endsWith('index.yaml')`
         * 
         * as well as do slightly more complex investigation of deserialized object properties,
         * like finding all objects which contain `published` property set to `true`):
         * 
         *     `return obj.published === true`
         * 
         * or both.
         */
        queryExpression: string
        keyExpression?: string
      }) => ValueHook<{ indexID: string | undefined }>;

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

      /** Disables the checks against oldValue keys in the changeset. */
      _dangerouslySkipValidation?: true 
    }) => Promise<CommitOutcome>

    export type UpdateObjectTree = (opts: {
      /** Old subtree root, dataset-relative. */
      subtreeRoot: string

      /** New subtree root, dataset-relative. If null, tree will be deleted. */
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


export type RemoteUsernameHook = () => ValueHook<{
  /**
   * Remote Git username,
   * as specified for this repository by the user in Paneron settings.
   */
  username?: string
}>
