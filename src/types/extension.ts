import type React from 'react';
import { MigrationModule } from './migrations';
import { DatasetContext } from './renderer';


/* The interface that extension instance exposes to Paneron in main thread. */
export interface MainPlugin {
  // False means another version of the host app must be used (probably a newer one).
  isCompatible: (withHostAppVersion: string) => boolean

  // Non-null result means migration must be applied for user to proceed.
  getMigration: (datasetVersion: string) => { versionSpec: string, migration: () => MigrationModule } | undefined

  getInitialMigration: () => MigrationModule
}


/* The interface that extension instance exposes to Paneron in renderer thread. */
export interface RendererPlugin {
  mainView?: React.FC<DatasetContext>
}

export type Extension = MainPlugin | RendererPlugin;