// Describes progress of some operation
export interface Progress<P extends string = string> {
  phase: P
  loaded: number
  total: number
}
