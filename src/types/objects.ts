/* Objects describe logical data atoms.

   An object is comprised of one or more **buffers**.

   Object path is taken to be the path to its root buffer
   relative to dataset (not repository as a whole).

   Conversion between buffers and objects is specified
   by object specs.
*/

import { Change, Changeset } from './changes';


/* DEPRECATED. */
export type Object = Record<string, any>;
// TODO: Rename this type to avoid the clash with default Object.
// Options: LogicalObject?

export type ObjectDataset = { [objectPath: string]: Object | null };

export type ObjectChange<T extends Object = any> = Change<T>;

export type ObjectChangeset<T extends Object = any> = Changeset<ObjectChange<T>>
