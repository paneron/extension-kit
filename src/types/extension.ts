import type React from 'react';
import type { ObjectSpec, ObjectSpecViewID, ObjectViewProps } from './object-spec';
import type { DatasetMigrationFunction, MigrationModule } from './migrations';
import type { DatasetContext } from './renderer';
import type { ExporterModule } from './export-formats';


/**
 * The interface that extension instance exposes in Electron main thread.
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


/** The interface that extension instance exposes in browser. */
export interface RendererPlugin {
  /** Dataset-wide view. */
  mainView?: React.FC<DatasetContext>

  /** Deprecated. */
  getObjectView:
    (opts: { objectPath: string, viewID: ObjectSpecViewID }) =>
      React.FC<ObjectViewProps> | undefined

  exportFormats: {
    [name: string]: () => ExporterModule
  }
}

/** The interface that extension instance exposes to CLI user. */
export interface CLIPlugin {
  exportFormats: {
    [name: string]: () => ExporterModule
  }
}

export type Extension = MainPlugin | RendererPlugin | CLIPlugin;
