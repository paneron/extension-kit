/* Buffers describe physical data atoms.
   A buffer is a raw binary blob
   and in current implementation maps to a file on disk
   (or an object in Git repo).

   A buffer is associated with a path (in POSIX format)
   that describes its place in the tree.

   Multiple buffers may comprise a single logical **object**.
*/


export type ChangeStatus = 'modified' | 'added' | 'removed' | 'unchanged';

export type BufferDataset = { [bufferPath: string]: Uint8Array | null };

export type BufferChange = { newValue: Uint8Array | null, oldValue?: Uint8Array | null }

export type BufferChangeset = { [bufferPath: string]: BufferChange };

export type BufferChangeStatusSet = { [bufferPath: string]: ChangeStatus };

/* The result of applying a BufferChangeset. */
// TODO: “Commit hash” ties this to Git; potentially this could be made generic.
export interface CommitOutcome {
  newCommitHash?: string
  conflicts?: {
    [bufferPath: string]: true
  }
}
