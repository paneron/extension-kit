import type { FileFilter } from 'electron';
import {
  CommitOutcome, FileChangeType,
  ObjectChangeset,
  ObjectDataRequest, ObjectDataset,
  ObjectQuery,
} from './data';


export interface DatasetContext {
  title: string

  useObjectsChangedEvent: ObjectsChangedEventHook
  useObjectPaths: ObjectPathsHook
  useObjectSyncStatus: ObjectSyncStatusHook
  useObjectData: ObjectDataHook

  getRuntimeNodeModulePath?: (moduleName: string) => string

  // Invokes file selection dialog, returns file data, does not alter the data
  requestFileFromFilesystem: (opts: OpenDialogProps) => Promise<ObjectDataset>

  // Generates a UUID. Not really useful in read-only mode
  makeRandomID: () => Promise<string>

  // Prompts the user to commit changes to the repository.
  // User can review and change the commit message.
  changeObjects?: (changeset: ObjectChangeset, commitMessage: string, ignoreConflicts?: boolean) =>
    Promise<CommitOutcome>

  // Invokes file selection dialog,
  // adds selected file(s) to the repository at given location,
  // prompts the user to commit changes to the repository,
  // returns commit outcome.
  // Provisional, probably won’t happen
  // onAddFile?: (opts: OpenDialogProps, commitMessage: string, targetPath: string) => Promise<CommitOutcome & { addedObjects: ObjectDataset }>
}


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

// These hooks take and return dataset-relative (not repo-relative) object paths.
export type ObjectPathsHook = (query: ObjectQuery) => ValueHook<string[]>
export type ObjectSyncStatusHook = () => ValueHook<Record<string, FileChangeType>>
export type ObjectDataHook = (objects: ObjectDataRequest) => ValueHook<ObjectDataset>

// TODO: Make paths here dataset-relative.
export type ObjectsChangedEventHook = (
  eventCallback: (event: { objects?: Record<string, Omit<FileChangeType, 'unchanged'> | true> }) => Promise<void>,
  args: any[],
) => void

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
