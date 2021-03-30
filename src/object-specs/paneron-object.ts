import path from 'path';
import { SerDesRule } from '../types/object-spec';
import { OnlyJSON } from '../util';


export const utf8Decoder = new TextDecoder('utf-8');


interface PartSerDes<T> {
  deserialize: (buf: Uint8Array) => T
  serialize: (obj: T) => Uint8Array
}


const stringSerDes: PartSerDes<string> = {
  deserialize: (buf) => utf8Decoder.decode(buf),
  serialize: (val) => Buffer.from(val, 'utf-8'),
};

const numberSerDes: PartSerDes<number> = {
  deserialize: (buf) => parseInt(utf8Decoder.decode(buf), 10),
  serialize: (val) => Buffer.from(val.toString(), 'utf-8'),
};

const partSerDes: { [key in DataType]: PartSerDes<any> } = {
  'text': stringSerDes,
  'number': numberSerDes,
};


interface PartSerDesOptions {
  dataType: DataType
}

interface SerDesOptions {
  parts: {
    [propertyPath: string]: PartSerDesOptions
  }
}

type DataType = 'text' | 'number';

//const EXT = '.pan';


/* Creates a spec for objects where a serialized object
   is represented as a tree of buffers.

   An object is represented as comprised from “parts”,
   where each part corresponds to a buffer (e.g., file).

   The default behavior is such that e.g.

       { title: "Hello world", foo: { bar: baz } }

   after disassembly (basic flattening) would be represented as:

       { "/title": "Hello world", "/foo/bar": "baz" }

   (On disk, title and foo/bar would be paths to files
   relative to object root path.)
*/
export function makePaneronObjectCompositeSerDesRule
<T extends Record<string, any> & OnlyJSON<Record<string, any>> = any>
():
SerDesRule<T> {
  const assemble: (data: any) => T = unflattenObject;
  const disassemble: (obj: T) => Record<string, any> = flattenObject;

  return {
    deserialize: (rawData, opts: SerDesOptions) => {
      function deserializePart(buf: Uint8Array, partPath: string): any {
        return partSerDes[opts.parts[partPath]?.dataType ?? 'text'].deserialize(buf);
      }
      const parts = deserializeParts(rawData, deserializePart);
      return assemble(parts);
    },
    serialize: (obj, opts: SerDesOptions) => {
      function serializePart(data: any, partPath: string): Uint8Array {
        return partSerDes[opts.parts[partPath]?.dataType ?? 'text'].serialize(data);
      }
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

  const prefix = _prefix !== false
    ? (_prefix + path.posix.sep)
    : path.posix.sep;

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
