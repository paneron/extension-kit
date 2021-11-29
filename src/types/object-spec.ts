export interface PathMatcher {
  /**
   * Will apply any object path under given prefix,
   * slash-prepended, relative to dataset root. */
  pathPrefix?: string

  /**
   * Will apply if this function,
   * called with object path relative to dataset root, returns true. */
  path?: (objectPath: string) => boolean
}


/** 
 * Describes how Paneron built-in GUI should treat an object
 * that matches this spec.
 */
export interface ObjectSpec {

  /**
   * All given conditions will be AND’ed together in order.
   * 
   * If none are given, object is considered matching by default,
   * so object spec with empty `matches` rule that comes last in a list
   * can act as a catch-all.
   */
  matches: PathMatcher

  /* Views for objects of this type.
     Paneron can use these views when showing objects
     in its own views outside of extension’s main dataset view
     (e.g., during conflict resolution).
     Extension may or may not use same views in its main dataset view. */
  views?: () => Promise<{ default: Record<string, React.FC<{ objectPath: string }>> }>

}


export enum AtomicSerDesRuleName {
  textFile = 'textfile',
  jsonFile = 'jsonfile',
  yamlFile = 'yamlfile',
  binaryFile = 'binaryfile',
}

export enum CompositeSerDesRuleName {
  paneronObject = 'paneronObject',
}

export type SerDesRuleName = AtomicSerDesRuleName | CompositeSerDesRuleName


/**
 * Specifies how to transform an object as runtime in-memory structure
 * to a storeable byte array and vice-versa
 * (i.e., serializer/deserializer).
 */
export interface SerDesRule<
  ObjectType extends Record<string, any> = any,
  Opts extends Record<string, any> = any,
> {
  /** Called with object data, returns buffer dataset (a record that maps file paths to buffer data). */
  serialize: (object: ObjectType, opts: Opts) => Record<string, Uint8Array>

  /** Called with a buffer dataset, returns object representation, deserialized if possible. */
  deserialize: (data: Record<string, Uint8Array>, opts: Opts) => ObjectType
}
