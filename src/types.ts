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

export interface RepositoryViewProps {
  title: string
  useRepoContentsChanged:
    (eventCallback: (event: { workingCopyPath: string, objects: Record<string, true> }) => Promise<void>, args: any[]) => void
  readObjects: (objects: Record<string, true>) => Promise<ObjectContentSet>
  changeObjects: (changeset: ObjectContentSet, commitMessage: string) => Promise<{
    success: true
  }>
}
