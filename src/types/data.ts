export type FileChangeType = 'modified' | 'added' | 'removed' | 'unchanged';


/* Describes single object’s data, can be text with specified encoding or binary */
export type ObjectData = null
  | { value: string, encoding: string }
  | { value: Uint8Array, encoding: undefined }


/* Maps a set of object paths to respective data. */
export interface ObjectDataset {
  [objectPath: string]: ObjectData
}


/* Describes a query to get a set of objects without knowing their paths. */
export interface ObjectQuery {
  pathPrefix: string
  contentSubstring?: string
}


/* Describes a query to get object data for specified object paths. */
export type ObjectDataRequest = Record<string, 'utf-8' | 'binary'>;


/* Describes a change made to a single object. */
export type ObjectChange =
  | { newValue: string | null, encoding: string, oldValue?: string | null }
  | { newValue: Uint8Array | null, encoding: undefined, oldValue?: Uint8Array | null }


/* Maps changes to object paths. */
export interface ObjectChangeset {
  // Object path must be supplied / is returned relative to repository root.
  // Writing null must cause the object to be deleted.
  // When null is returned, it means object does not exist.
  [objectPath: string]: ObjectChange
}


/* Result of applying ObjectChangeset. */
export interface CommitOutcome {
  newCommitHash?: string
  conflicts?: {
    [objectPath: string]: true
  }
}
