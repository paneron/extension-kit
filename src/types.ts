// Repository view props—belongs to Paneron
import type React from 'react';

export interface MainPlugin {}

type PluginComponentProps = Pick<RepositoryViewProps, 'React'>;
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
  // TODO: Duplicated in Paneron core
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

// TODO: Duplicated within Paneron core
export type ObjectDataRequest = Record<string, 'utf-8' | undefined>;

export type ObjectPathsHook = (query: ObjectQuery) => ValueHook<string[]>
export type ObjectDataHook = (objects: ObjectDataRequest) => ValueHook<ObjectDataset>
export type RemoteUsernameHook = () => ValueHook<{ username?: string }>


export interface RepositoryViewProps {
  title: string

  React: typeof React
  setTimeout: typeof window["setTimeout"]

  useObjectsChangedEvent: ObjectsChangedEventHook
  useObjectPaths: ObjectPathsHook
  useObjectData: ObjectDataHook
  useRemoteUsername: RemoteUsernameHook
  makeRandomID: () => Promise<string>
  changeObjects: (changeset: ObjectChangeset, commitMessage: string) => Promise<CommitOutcome>
}
