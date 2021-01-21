export type DiffStatus = 'modified' | 'added' | 'removed' | 'unchanged';

export type ChangeStatus = Omit<DiffStatus, 'unchanged'>;

export interface PathDiff {
  [path: string]: DiffStatus
}

export interface PathChanges {
  [path: string]: ChangeStatus
}

export type Change<T extends Uint8Array | Record<string, any>> =
  { newValue: T | null, oldValue?: T | null };

/* The result of applying a changeset.

   `conflicts` shows how paths don’t match reference data (`oldValue`s)
   provided by the changeset. Ideally conflicts would be an empty object,

   Paths in conflicts can be object or buffer paths,
   depending on use case.
*/
// TODO: “Commit hash” ties this to Git; potentially this could be made generic.
export interface CommitOutcome {
  newCommitHash?: string
  conflicts?: PathChanges
}
