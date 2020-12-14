import { ObjectChangeset } from "./data";

export interface DatasetMigrationOptions {
  datasetRootPath: string
  versionBefore?: string
  onProgress?: (message: string) => void
}

/* Changeset describing changes that will make the dataset
   conform to a version, and that version. */
interface DatasetMigrationSpec {
  changeset: ObjectChangeset
  versionAfter: string
}

/* Given dataset path and current (‘before’) version, checks files at that path
   and returns a migration spec.

   If current version is not given, assume that a new dataset is initialized. */
export type DatasetMigrationFunction = (opts: DatasetMigrationOptions) => Promise<DatasetMigrationSpec>;
