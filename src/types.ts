// Repository view props—belongs to Paneron
import type React from 'react';

export interface MainPlugin {}

export type RendererPlugin = Promise<{
  repositoryView?: React.FC<RepositoryViewProps>
}>

export type Plugin = MainPlugin | RendererPlugin;

// TODO: Duplication in Paneron core
interface ObjectDataset {
  [objectPath: string]: ObjectData
}
type ObjectData = null
  | { value: string, encoding: string }
  | { value: Uint8Array, encoding: undefined }
interface ObjectQuery {
  pathPrefix: string
  contentSubstring?: string
}


export type ObjectsChangedEventHook = (
  eventCallback: (event: { objects: Record<string, true> }) => Promise<void>,
  args: any[],
) => void


export type UseObjectPathsHook = (
  query: ObjectQuery
) => {
  value: string[]
  errors: Error[]
  isUpdating: boolean
  refresh: () => void
  _reqCounter: number
}


export type UseObjectDataHook = (
  objects: Record<string, true>
) => {
  value: ObjectDataset
  errors: Error[]
  isUpdating: boolean
  refresh: () => void
  _reqCounter: number
}

export interface RepositoryViewProps {
  title: string
  react: typeof React
  useObjectsChangedEvent: ObjectsChangedEventHook
  useObjectPaths: UseObjectPathsHook
  useObjectData: UseObjectDataHook
  changeObjects: (changeset: ObjectDataset, commitMessage: string) => Promise<{
    success: true
  }>
}
