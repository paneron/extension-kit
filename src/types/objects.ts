/* Objects describe logical data atoms.

   An object is comprised of one or more **buffers**.

   Object path is taken to be the path to its root buffer
   relative to dataset (not repository as a whole).

   Conversion between buffers and objects is specified
   by object specs.
*/


export type Object = Record<string, any>;


export type ObjectDataset = {
  [objectPath: string]: Object
};


export type ObjectChange<T extends Object = any> = {
  // A null value below means nonexistend object at this path.
  // newValue: null means delete object, if it exists.
  // oldValue: null means the object previously did not exist.
  newValue: T | null
  oldValue?: T | null
  // Undefined oldValue means no consistency check
};


export type ObjectChangeset<T extends Object = any> = {
  [bufferPath: string]: ObjectChange<T>
};
