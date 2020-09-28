// Repository view props—belongs to Paneron
import type React from 'react';

interface MainPlugin {}

interface RendererPlugin {
  repositoryView?: React.FC<RepositoryViewProps>
}

export type Plugin = MainPlugin | RendererPlugin;

interface ObjectContentSet {
  [objectPath: string]: string | null
}

export interface RepositoryViewProps {
  title: string
  readObjects: (objects: Record<string, true>) => Promise<ObjectContentSet>
  changeObjects: (changeset: ObjectContentSet, commitMessage: string) => Promise<{
    success: true
  }>
}
