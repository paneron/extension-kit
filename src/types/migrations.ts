/**
 * Migrations are used to update dataset structure as extension evolves.
 * Not every extension version requires a structure update.
 *
 * “Dataset extension”
 * generally means “extension version captured in dataset metadata”.
 *
 * A migration uses functions to retrieve deserialized object data
 * and generates serialized buffer data as a result.
 */

import type { BufferDataset } from './buffers';
import type { DatasetContext } from './renderer';


export interface DatasetMigrationOptions
extends Pick<DatasetContext, 'getObjectData' | 'getMapReducedData'> {
  /** Current version of the dataset. */
  versionBefore?: string
  onProgress?: (message: string, loaded?: number, total?: number) => void
}

export interface MigrationInfo {
  /**
   * Version of the dataset to set after applying the migration.
   * Must not satisfy `versionBefore`, otherwise means infinite migration loop.
   *
   * This is ignored for initial migration, which is naturally expected
   * to migrate the dataset to extension version. 
   */
  versionAfter: string
  migrator: MigratorConstructor
}

/**
 * Migrator function is a generator of buffer datasets
 * with dataset-relative paths. A path assigned to `null`
 * means buffer at that path will be deleted, if existed.
 */
export type Migrator = AsyncGenerator<BufferDataset, void, void>;

export type MigratorConstructor = (opts: DatasetMigrationOptions) => Migrator;
