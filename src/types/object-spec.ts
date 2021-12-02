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

  /**
   * Available views for objects matching this type.
   * 
   * Paneron can use these views when showing objects
   * in its own views outside of extension’s main dataset view
   * (e.g., during conflict resolution).
   * 
   * Paneron uses views “full” and “item”.
   */
  views?: () => Promise<{ default: ObjectSpecViews }>

}


const objectSpecViewIDs = [
  'full',
  'item',
] as const;


export type ObjectSpecViewID = typeof objectSpecViewIDs[number];


export interface ObjectViewProps {
  objectPath: string

  /** Deserialized object data to display. */
  objectData: Record<string, any>

  /**
   * If object can be changed, view should call this handler with updated data.
   * NOTE: Doesn’t make sense for some views (e.g., item views). */
  onChange?: (newData: Record<string, any>, msg?: string) => void
}


interface ObjectSpecViews {
  full: React.FC<ObjectViewProps>
  item?: React.FC<ObjectViewProps>
}


export enum AtomicSerDesRuleName {
  textFile = 'textfile',
  jsonFile = 'jsonfile',
  yamlFile = 'yamlfile',
  binaryFile = 'binaryfile',
}

export enum CompositeSerDesRuleName {
  //paneronObject = 'paneronObject',
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
