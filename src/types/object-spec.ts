/* Object specs describe how logical structured objects
   map to physical buffers.
*/


export interface ObjectSpec {

  /* Determines whether serialize/deserialize functions provided by this rule
     should be used for given buffer path.
     All given conditions will be AND’ed together in order.
     If none are given, buffer is considered matching by default. */
  matches: {
    /* Will match to buffer paths with given extensions. */
    extensions?: string[]

    /* Will apply to buffer paths under given prefix,
       slash-prepended, relative to dataset root. */
    pathPrefix?: string

    /* Will apply if this function,
       called with buffer path relative to dataset root, returns true.
       Slowest. */
    path?: (bufferPath: string) => boolean
  }

  /* Views for objects of this type.
     Paneron can use these views when showing objects
     in its own views outside of extension’s main dataset view
     (e.g., during conflict resolution).
     Extension may or may not use same views in its main dataset view. */
  views?: () => Promise<{ default: Record<string, React.FC<{ objectPath: string }>> }>

}


/* A serializable object consists of one (or more) raw buffers
   located at (or under) object path. */
export interface SerializableObjectSpec<T extends Record<string, any> = any>
extends ObjectSpec, SerDes<T> {}


export interface BinaryObjectSpec
extends SerializableObjectSpec<{ binaryData: Uint8Array, asBase64: string }> {}


/* Specifies how to transform an object as runtime in-memory structure
   to a storeable byte array and vice-versa
   (i.e., serializer/deserializer). */
interface SerDes<ObjectType extends Record<string, any> = any> {
  serialize: (object: ObjectType) => Record<string, Uint8Array>
  deserialize: (data: Record<string, Uint8Array>) => ObjectType
}
