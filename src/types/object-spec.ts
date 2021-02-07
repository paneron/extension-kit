/* Object specs describe how logical structured objects
   map to physical buffers.
*/


export interface SerializableObjectSpec {

  /* Determines whether serialize/deserialize functions provided by this rule
     should be used for given buffer path.

     getContainingObjectPath() can be used to get containing object’s path
     from a given buffer path.

     All given conditions will be AND’ed together in order.
     If none are given, buffer is considered matching by default.

     Buffers that are descendants of matching path
     are considered path of the same object.
  */
  matches: {
    /* Will match to buffer paths with given extensions. */
    extensions?: string[]

    /* Will apply to buffer paths under given prefix,
       slash-prepended, relative to dataset root. */
    pathPrefix?: string

    /* Will apply if this function,
       called with buffer path relative to dataset root, returns true.
       Slowest. */
    path?: string // function body matching (bufferPath: string) => boolean
  }

  /* References the name of serialization/deserialization rule implementation. */
  serDesRule: SerDesRuleName

  getContainingObjectPath?: string // function body matching (bufferPath: string) => string | null

  //pathContaining(bufferPath: string): string

  /* Views for objects of this type.
     Paneron can use these views when showing objects
     in its own views outside of extension’s main dataset view
     (e.g., during conflict resolution).
     Extension may or may not use same views in its main dataset view. */
  views?: () => Promise<{ default: Record<string, React.FC<{ objectPath: string }>> }>

}


export enum SerDesRuleName {
  textFile = 'textfile',
  jsonFile = 'jsonfile',
  yamlFile = 'yamlfile',
  tree = 'tree',
  binaryFile = 'binaryfile',
}


export interface BinaryObjectSpec
extends SerializableObjectSpec {}


/* Specifies how to transform an object as runtime in-memory structure
   to a storeable byte array and vice-versa
   (i.e., serializer/deserializer). */
export interface SerDesRule<
  ObjectType extends Record<string, any> = any,
  Opts extends Record<string, any> = any,
> {
  id: SerDesRuleName
  serialize: (object: ObjectType, opts: Opts) => Record<string, Uint8Array>
  deserialize: (data: Record<string, Uint8Array>, opts: Opts) => ObjectType
}
