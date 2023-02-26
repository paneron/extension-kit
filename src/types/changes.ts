export type ChangeStatus = 'modified' | 'added' | 'removed';

export type DiffStatus = ChangeStatus | 'unchanged';

export interface PathDiff {
  [path: string]: DiffStatus
}

export interface PathChanges {
  [path: string]: ChangeStatus
}

/**
 * Describes a change of an object.
 *
 * A null value below means nonexistend object at this path.
 *
 * - newValue: null means delete object, if it exists.
 * - oldValue: null means the object previously did not exist.
 * - Undefined (unspecified) oldValue means no consistency check.
 */
export type Change<T extends Uint8Array | Record<string, any>> =
  { newValue: T | null, oldValue?: T | null };

export type Changeset<C extends Change<any>> = {
  [path: string]: C
}

/**
 * The result of applying a changeset.
 *
 * `conflicts` shows how paths don’t match reference data (`oldValue`s)
 * provided by the changeset. Ideally conflicts would be an empty object,
 *
 * Paths in conflicts can be object or buffer paths,
 * depending on use case.
 */
export interface CommitOutcome {
  // TODO: “Commit hash” ties this to Git; potentially this could be made generic.
  newCommitHash?: string
  conflicts?: PathChanges
}
