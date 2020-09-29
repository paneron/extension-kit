// Repository view props—belongs to Paneron
import type React from 'react';

export interface MainPlugin {}

export type RendererPlugin = Promise<{
  repositoryView?: React.FC<RepositoryViewProps>
}>

export type Plugin = MainPlugin | RendererPlugin;

interface ObjectContentSet {
  [objectPath: string]: string | null
}


export type ObjectsChangedEventHook = (
  eventCallback: (event: { objects: Record<string, true> }) => Promise<void>,
  args: any[],
) => void


export type UseObjectPathsHook = (
  query: Record<string, any>
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
  value: ObjectContentSet
  errors: Error[]
  isUpdating: boolean
  refresh: () => void
  _reqCounter: number
}


export interface RepositoryViewProps {
  title: string
  useObjectsChangedEvent: ObjectsChangedEventHook
  useObjectPaths: UseObjectPathsHook
  useObjectData: UseObjectDataHook
  changeObjects: (changeset: ObjectContentSet, commitMessage: string) => Promise<{
    success: true
  }>
}
