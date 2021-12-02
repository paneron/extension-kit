/**
 * Objects describe logical data atoms.
 *
 * On physical level, an object is comprised of one or more **buffers**.
 *
 * Object path is taken to be the path to its root buffer
 * relative to dataset (not repository as a whole).
 *
 * Conversion between buffers and objects is specified
 * by ser/des rules.
 */

import { Change, Changeset } from './changes';


/* DEPRECATED. */
export type Object = Record<string, any>;
// TODO: Rename this type to avoid the clash with default Object.
// Options: LogicalObject?

export type ObjectDataset = { [objectPath: string]: Object | null };

export type ObjectChange<T extends Object = Record<string, any>> = Change<T>;

export type ObjectChangeset<T extends Object = Record<string, any>> = Changeset<ObjectChange<T>>
