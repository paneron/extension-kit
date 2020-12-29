import type React from 'react';
import { MigrationModule } from './migrations';
import { DatasetContext } from './renderer';


/* The interface that extension instance exposes to Paneron in main thread. */
export interface MainPlugin {

  // False means another version of the host app must be used (probably a newer one).
  isCompatible: (withHostAppVersion: string) => boolean

  // Non-null result means migration must be applied for user to proceed.
  getMigration: (datasetVersion: string) => {
    versionSpec: string
    migration: () => MigrationModule 
  } | undefined

  getInitialMigration: () => MigrationModule

  // Converts buffers with raw file data per path
  // to structured records (as JS objects) per path.
  // Specs for conversion can be provided to makeExtension to customize
  // how object is represented.
  // NOTE: Slow, when processing full repository data
  // it is supposed to be called from a worker thread only.
  indexObjects: (rawData: Record<string, Uint8Array>) =>
    Record<string, Record<string, any>>

  // Converts a record that maps paths to object data
  // to a record that maps paths to buffers / byte arrays
  // ready for storage.
  objectsToBuffers: (objects: Record<string, Record<string, any>>) =>
    Record<string, Uint8Array>

}


/* The interface that extension instance exposes to Paneron in renderer thread. */
export interface RendererPlugin {
  mainView?: React.FC<DatasetContext>
}

export type Extension = MainPlugin | RendererPlugin;
