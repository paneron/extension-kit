import { ObjectSpec, SerializableObjectSpec } from '../types/object-spec';


/* Creates a spec for objects where a serialized object
   is represented as a tree of buffers
   (for example, .yaml files in nested directories).

   An object is represented as comprised from “parts”,
   where each part corresponds to a buffer (e.g., file).

   `assembleFromParts()` and `disassembleIntoParts()`
   determine how an object
   is converted between its “canonical” full JS runtime structure
   and a flat object structure that maps slash-separated buffer paths
   to serializable parts for storage.

   The default behavior is such that e.g.

       { title: "Hello world", foo: { bar: baz } }

   after disassembly (basic flattening) would be represented as:

       { "/title": "Hello world", "/foo/bar": "baz" }

   (On disk, title and foo/bar would be paths to files
   relative to object root path.)

   `serializePart` and `deserializePart` specify how individual part
   is converted between a buffer and a JS structure.

   TODO: Implement partPathExtension, indexPath, partKeyPaths options.

   The goal is to allow the above object after disassembly
   to be represented as

       { "/index.yaml": { title: "Hello world" }, "/foo.yaml": { "bar": "baz" } }

   partKeyPaths specifies which object keys (dot-separated for nesting)
   reside in separate parts/buffers. In above example, it’d be ['foo'].
   Any key that doesn’t have a match in partKeyPaths
   goes into “index” part under indexPath.
   If partKeyPaths is empty list,
   object is stored as a single part under indexPath.
   If partKeyPaths is not given,
   every object key would be treated as its own part:

       { "/title": "Hello world", "/foo/bar": "baz" }
*/
export function makeNestedSerializableObjectSpec
<T extends Record<string, any> = any>(opts: {
  matches: ObjectSpec["matches"]
  views: ObjectSpec["views"]

  serializePart: (partData: any) => Uint8Array
  deserializePart: (buffer: Uint8Array) => any

  // These three don’t have effect if assembleFromParts
  // or disassembleIntoParts is specified.
  // partPathExtension?: string
  // indexPath?: string
  // partKeyPaths?: string[]

  // Assembly is more important, since it would be responsible
  // for any type coercion if needed.
  assembleFromParts?: (partData: any) => T
  // This may not be required, if default disassembly logic is sufficient.
  disassembleIntoParts?: (obj: T) => Record<string, any>
}): SerializableObjectSpec {
  const {
    matches,
    views,
    deserializePart,
    assembleFromParts,
    disassembleIntoParts,
    serializePart,
  } = opts;

  // const partPathExtension = opts.partPathExtension || '';
  // const indexPath = opts.indexPath || `index${partPathExtension}`;
  // const partKeyPaths = opts.partKeyPaths;

  const assemble: (data: any) => T =
    assembleFromParts || unflattenObject;

  const disassemble: (obj: T) => Record<string, any> =
    disassembleIntoParts || flattenObject;

  return {
    matches,
    views,
    deserialize: (rawData) => {
      const parts = deserializeParts(rawData, deserializePart);
      return assemble(parts);
    },
    serialize: (obj) => {
      const parts = disassemble(obj);
      return serializeParts(parts, serializePart);
    },
  };
}



/* Aggregates parts (mapped to slash-separated paths) into a nested object.

   E.g.:

     { /some/path: A, /foo: B, /some/other/path: C }
   
   gets turned into:

     { foo: B, some: { path: A, other: { path: C } } }
*/

export function unflattenObject<T extends Record<string, any>>
(parts: Record<string, any>): T {
  const result: Record<string, any> = {};
  // Ideally should be typed as Partial<T>, but that causes problems down the line

  for (const partPath of Object.keys(parts)) {
    if (Object.prototype.hasOwnProperty.call(parts, partPath)) {

      const keys = partPath.match(/^\/+[^\/]*|[^\/]*\/+$|(?:\/{2,}|[^\/])+(?:\/+$)?/g);
      // Matches a standalone slash in a key
      //const keys = partPath.match(/^\.+[^.]*|[^.]*\.+$|(?:\.{2,}|[^.])+(?:\.+$)?/g);

      if (keys) {
        keys.reduce((accumulator, val, idx) => {
          return accumulator[val] || (
            (accumulator[val] = isNaN(Number(keys[idx + 1]))
              ? (keys.length - 1 === idx
                ? parts[partPath]
                : {})
              : [])
          );
        }, result);
      }
    }
  }

  return result as T;
}

//export function unflattenObject<T extends Record<string, any>>(
//  parts: Record<string, any>,
//): T {
//  const obj: Record<string, any> = {};
//  // Ideally should be typed as Partial<T>, but that causes problems down the line.
//
//  Object.keys(obj).sort().map((partPath) => {
//    const pathParts = stripLeadingSlash(partPath).split('/');
//
//    // Initialize currentLevel to root
//    let currentLevel = obj;
//
//    const data = parts[partPath];
//
//    // Assign data to appropriately nested key in the object
//    pathParts.map((part) => {
//      // Check to see if key already exists
//      const existingPath = currentLevel[part];
//
//      if (existingPath) {
//        // Set current level to nested key’s level
//        currentLevel = existingPath;
//      } else {
//        // Add key and part data to current level
//        currentLevel[part] = data;
//        // Set current level to key’s level
//        currentLevel = currentLevel[part];
//      }
//    });
//  });
//
//  return obj as T;
//}


/* Recursively decomposes an arbitrarily nested object into a flat record
   of slash-separated part paths mapped to respective structures.

   E.g.:

     { foo: B, some: { path: A, other: { path: C } } }
   
   gets turned into:

     { /some/path: A, /foo: B, /some/other/path: C }
*/
export function flattenObject(
  obj: Record<string, any>,
  _prefix: false | string = false,
  _result: Record<string, any> | null = null,
): Record<string, any> {
  const result: Record<string, any> = _result || {};

  // Preserve empty objects and arrays, they are lost otherwise
  if (_prefix !== false &&
      typeof obj === 'object' &&
      obj !== null &&
      Object.keys(obj).length === 0) {
    result[_prefix] = Array.isArray(obj) ? [] : {};
    return result;
  }

  const prefix = _prefix ? _prefix + '/' : '';

  for (const i in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, i)) {
      if (typeof obj[i] === 'object' && obj[i] !== null) {
        // Recursion on deeper objects
        flattenObject(obj[i], prefix + i, result);
      } else {
        result[prefix + i] = obj[i];
      }
    }
  }
  return result;
}


function deserializeParts(
  buffers: Record<string, Uint8Array>,
  partFromBuffer: (buffer: Uint8Array, path: string) => any,
): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [p, buffer] of Object.entries(buffers)) {
    result[p] = partFromBuffer(buffer, p);
  }
  return result;
}


function serializeParts(
  parts: Record<string, any>,
  partToBuffer: (data: any, path: string) => Uint8Array,
): Record<string, Uint8Array> {
  const result: Record<string, Uint8Array> = {};
  for (const [p, part] of Object.entries(parts)) {
    result[p] = partToBuffer(part, p);
  }
  return result;
}
