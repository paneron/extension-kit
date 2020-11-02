import type { FileFilter } from 'electron';
import type React from 'react';

export interface MainPlugin {}

export type PluginComponentProps = {}
export type PluginFC<T> = React.FC<PluginComponentProps & T>;

export type RendererPlugin = Promise<{
  repositoryView?: PluginFC<any>
}>

export type Plugin = MainPlugin | RendererPlugin;


export interface ObjectDataset {
  [objectPath: string]: ObjectData
}
export type ObjectData = null
  | { value: string, encoding: string }
  | { value: Uint8Array, encoding: undefined }
interface ObjectQuery {
  pathPrefix: string
  contentSubstring?: string
}

export type ObjectChange =
  | { newValue: string | null, encoding: string, oldValue?: string | null }
  | { newValue: Uint8Array | null, encoding: undefined, oldValue?: Uint8Array | null }
export interface ObjectChangeset {
  // Object path must be supplied / is returned relative to repository root.
  // Writing null must cause the object to be deleted.
  // When null is returned, it means object does not exist.
  [objectPath: string]: ObjectChange
}

export interface CommitOutcome {
  newCommitHash?: string
  conflicts?: {
    [objectPath: string]: true
  }
}


export type ObjectsChangedEventHook = (
  eventCallback: (event: { objects?: Record<string, 'added' | 'modified' | 'removed' | true> }) => Promise<void>,
  args: any[],
) => void


export interface ValueHook<T> {
  value: T
  errors: Error[]
  isUpdating: boolean
  refresh: () => void
  _reqCounter: number
}

export type ObjectDataRequest = Record<string, 'utf-8' | 'binary'>;

export type ObjectPathsHook = (query: ObjectQuery) => ValueHook<string[]>
export type ObjectSyncStatusHook = () => ValueHook<Record<string, FileChangeType>>
export type ObjectDataHook = (objects: ObjectDataRequest) => ValueHook<ObjectDataset>
export type RemoteUsernameHook = () => ValueHook<{ username?: string }>
export type AuthorEmailHook = () => ValueHook<{ email: string }>


export interface OpenDialogProps {
  prompt: string
  filters?: FileFilter[]
  allowMultiple?: boolean
}


export interface RepositoryViewProps extends PluginComponentProps {
  title: string

  useObjectsChangedEvent: ObjectsChangedEventHook
  useObjectPaths: ObjectPathsHook
  useObjectSyncStatus: ObjectSyncStatusHook
  useObjectData: ObjectDataHook
  useRemoteUsername: RemoteUsernameHook
  useAuthorEmail: AuthorEmailHook

  makeRandomID: () => Promise<string>

  makeAbsolutePath: (path: string) => string

  requestFileFromFilesystem: (opts: OpenDialogProps) => Promise<ObjectDataset>

  addFileFromFilesystem?: (opts: OpenDialogProps, commitMessage: string, targetPath: string) =>
    Promise<CommitOutcome & { addedObjects: ObjectDataset }>

  changeObjects: (changeset: ObjectChangeset, commitMessage: string, ignoreConflicts?: boolean) =>
    Promise<CommitOutcome>
}


export type FileChangeType = 'modified' | 'added' | 'removed' | 'unchanged';
