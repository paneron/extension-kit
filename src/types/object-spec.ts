export interface ObjectSpec<T extends Record<string, any> = any> extends SerDes<T> {

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

  views: {
    default: () => Promise<{ default: React.FC<{ objectData: T }> }>
  }
}


/* Specifies how to transform an object as runtime in-memory structure
   to a storeable byte array and vice-versa
   (i.e., serializer/deserializer). */
export interface SerDes<ObjectType extends Record<string, any> = any> {
  serialize: (object: ObjectType) => SerializedObject
  deserialize: (data: SerializedObject) => ObjectType
}


/* Represents an object in a serialized state.
   A record that maps paths (relative to object root path) to byte arrays. */
export type SerializedObject = Record<string, Uint8Array>;
