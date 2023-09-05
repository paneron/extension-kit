export interface OperationOptions {
  /**
   * Consider this operation globally locking.
   *
   * If an operation is queued with this flag,
   * queueing further operations will fail until it’s complete,
   * so the user will have to wait.
   *
   * This is good for operations that change data, for example.
   * For operations that read data this is not necessary.
   *
   * Default is `true` (for compatibility, as it was
   * the only existing behavior previously).
   */
  blocking?: boolean;
}


export interface OperationWrapper<P extends unknown[], R> {
  (
    gerund: string,
    func: (...args: P) => Promise<R>,
    opts?: OperationOptions,
  ): (...args: P) => Promise<R>;
}
