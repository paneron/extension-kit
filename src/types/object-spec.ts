export interface ObjectSpec {

  /* Determines whether serialize/deserialize functions provided by this rule
     should be used for given object.
     All given conditions will be AND’ed together in the order.
     If none are given, object is considered matching by default. */
  matches: {
    /* Will apply to object paths with given extensions. */
    extensions?: string[]

    /* Will apply to object paths under given prefix, slash-prepended. */
    pathPrefix?: string

    /* Will apply if this function, called with entire path, returns true. Slowest. */
    path?: (objectPath: string) => boolean
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
extends ObjectSpec<T>, SerDes<T> {}


export interface BinaryObjectSpec extends SerializableObjectSpec<{ binaryData: Uint8Array, asBase64: string }> {}


/* Specifies how to transform an object as runtime in-memory structure
   to a storeable byte array and vice-versa
   (i.e., serializer/deserializer). */
interface SerDes<ObjectType extends Record<string, any> = any> {
  serialize: (object: ObjectType) => Buffers
  deserialize: (data: Buffers) => ObjectType
}


/* Represents an object in a serialized state.
   A record that maps paths (relative to object root path) to byte arrays. */
type Buffers = Record<string, Uint8Array>;
