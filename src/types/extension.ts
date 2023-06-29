import type React from 'react';
import type { ObjectSpec, ObjectSpecViewID, ObjectViewProps } from './object-spec';
import type { MigrationInfo } from './migrations';
import type { DatasetContext } from './renderer';
import type { ExportFormatConfiguration } from './export-formats';


/** The interface that extension instance exposes in browser. */
export interface RendererPlugin {
  /** Dataset-wide view. */
  mainView?: React.FC<DatasetContext>

  exportFormats: {
    [name: string]: ExportFormatConfiguration
  }

  /**
   * False return value
   * means another version of the host app must be used. 
   */
  isCompatible: (withHostAppVersion: string) => boolean

  /**
   * Compatible host app version spec.
   */
  requiredHostAppVersionSpec: string

  /**
   * Non-null return value means pending migration.
   */
  getMigration: (datasetVersion: string) => {
    /** Updated version spec */
    versionSpec: string
    /** Migration implementation */
    migration: MigrationInfo
  }

  initialMigration: MigrationInfo

  /** @deprecated Do not use. API may change. */
  getObjectSpecs: () => ObjectSpec[]

  /** @deprecated Do not use. API may change. */
  getObjectView:
    (opts: { objectPath: string, viewID: ObjectSpecViewID }) =>
      React.FC<ObjectViewProps> | undefined
}

export type Extension = RendererPlugin;
