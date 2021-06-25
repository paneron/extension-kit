// DEPRECATED: These types are legacy:
// - for binary data at physical level see buffers,
// - for structured data at logical level see objects.

// In context of Git/filesystem based data storage backend,
// which is currently the only context, “object” below refers to a file,
// and object path is a string like `folder1/folder2/file.yaml`
// (depending on context, can be relative to repository root or dataset root).
// Other backends may be implemented later, so let’s not involve filesystem specifics here.

// Encoding can be any string, but types elsewhere may restrict encoding to 'utf-8' or 'binary'
// (other encodings have not been tested).

export type FileChangeType = 'modified' | 'added' | 'removed' | 'unchanged';


/* Describes single object’s data, can be text with specified encoding or binary data. */
export type ObjectData = null
  | { value: string, encoding: string }
  | { value: Uint8Array, encoding: undefined }


/* Maps a set of object paths to respective data. */
export interface ObjectDataset {
  [objectPath: string]: ObjectData
}


/* Maps a set of object paths to object’s change status. */
export interface ObjectChangeStatusSet {
  [objectPath: string]: FileChangeType
}


/* Describes a query to retrieve which objects exist without knowing their paths. */
export interface ObjectQuery {
  pathPrefix: string
  contentSubstring?: string
}


/* Describes a query to get object data for specified object paths. */
export type ObjectDataRequest = Record<string, 'utf-8' | 'binary'>;


/* Describes a change made to a single object.

   For data consistency, users must provide `oldValue` to indicate which value should be replaced;
   if preexisting value is different from `oldValue` then there was likely a race condition
   (object data changed e.g. by another user), the new value should not be written
   and user should be informed about a conflict.

   `encoding` is not expected to change through the lifetime of an object.
*/
export type ObjectChange =
  | { newValue: string | null, encoding: string, oldValue?: string | null }
  | { newValue: Uint8Array | null, encoding: undefined, oldValue?: Uint8Array | null }


/* Maps object data changes to object paths. */
export interface ObjectChangeset {
  // Object path must be supplied / is returned relative to repository root.
  // Writing null must cause the object to be deleted.
  // When null is returned, it means object does not exist.
  [objectPath: string]: ObjectChange
}


/* The result of applying an ObjectChangeset. */
// TODO: “Commit hash” ties this to Git; potentially this could be made generic.
export interface CommitOutcome {
  newCommitHash?: string
  conflicts?: {
    [objectPath: string]: true
  }
}
