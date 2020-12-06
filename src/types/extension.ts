import type React from 'react';
import { DatasetMigrationFunction } from './migrations';
import { DatasetContext } from './renderer';

export interface MainPlugin {
  // False means another version of the host app must be used (probably a newer one).
  isCompatible: (withHostAppVersion: string) => boolean

  // Non-null result means migration must be applied for user to proceed.
  getMigration: (datasetVersion: string) => MigrationModule | null
}

export interface RendererPlugin {
  mainView?: React.FC<DatasetContext>
}

export type Extension = MainPlugin | RendererPlugin;

export type MigrationModule = Promise<{ default: DatasetMigrationFunction }>;
