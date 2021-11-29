import type React from 'react';
import type { ObjectSpec, ObjectSpecViewID, ObjectViewProps } from './object-spec';
import type { DatasetMigrationFunction, MigrationModule } from './migrations';
import type { DatasetContext } from './renderer';


/**
 * The interface that extension instance exposes to Paneron in main thread.
 * 
 * TODO: Deprecated.
 */
export interface MainPlugin {
  // False means another version of the host app must be used (probably a newer one).
  isCompatible: (withHostAppVersion: string) => boolean

  // Non-null result means migration must be applied for user to proceed.
  getMigration: (datasetVersion: string) => {
    versionSpec: string
    migration: () => MigrationModule 
  } | undefined

  initialMigration: DatasetMigrationFunction

  getObjectSpecs: () => ObjectSpec[]
}


/** The interface that extension instance exposes to Paneron in renderer thread. */
export interface RendererPlugin {
  mainView?: React.FC<DatasetContext>
  getObjectView:
    (opts: { objectPath: string, viewID: ObjectSpecViewID }) =>
      React.FC<ObjectViewProps> | undefined
}

export type Extension = MainPlugin | RendererPlugin;
