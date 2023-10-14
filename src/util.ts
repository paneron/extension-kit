import type { Progress } from './types/progress';


export function stripLeadingSlash(fp: string): string {
  return fp.replace(/^\//, '');
}

export function progressToValue(progress: Progress): number {
  return 1 / progress.total * progress.loaded;
}

export const encoder = new TextEncoder();

export const decoder = new TextDecoder('utf-8');

export type OnlyJSON<T> =
  T extends string | number | boolean | null
  ? T
  : T extends Function
    ? never
    : T extends object
      ? { [K in keyof T]: OnlyJSON<T[K]> }
      : never;


/**
 * Normalizes object by ensuring its keys are sorted.
 * May not be the most efficient way of doing so.
 */
export function normalizeObject<T extends Record<string, any>>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).sort()) as T;
}

export function toJSONPreservingUndefined(
  data: any,
  indentation?: number,
): string {
  return (JSON.
    stringify(
      data || {},
      (_, v) => (v === undefined) ? '__undefined' : v,
      indentation).
    replace(/\"__undefined\"/g, 'undefined'));
}

/**
 * NOTE: This is NOT a very fast implementation yet. Try to avoid.
 */
export function toJSONNormalized(val: any, indentation?: number) {
  return toJSONPreservingUndefined(normalizeVal(val), indentation);
}

/**
 * @deprecated use `toJSONNormalized()` instead.
 */
export const JSONStringifyNormalized = toJSONNormalized;

export function objectsHaveSameShape(l: any, r: any): boolean {
  return JSONStringifyNormalized(l) === JSONStringifyNormalized(r);
}

/**
 * Does the equivalent of `normalizeObject` on given object
 * as well as any objects encountered within.
 */
function normalizeObjectRecursively
<T extends Record<string, any>>
(obj: T, _seen: null | WeakSet<any> = null): T {
  const seen: WeakSet<any> = _seen ?? new WeakSet();

  if (seen.has(obj)) {
    return obj;
  }

  if (isObject(obj)) {
    seen.add(obj);

    const normalized = Object.fromEntries(
      Object.entries(obj).
        sort().
        map(([key, val]) => [
          key,
          normalizeVal(val, seen),
        ])
      ) as T;

    seen.delete(obj);

    return normalized;
  } else {
    throw new Error(`Not an object: ${obj}`);
  }
}

function normalizeVal<T>(val: T, _seen: null | WeakSet<any> = null): T {
  const seen: WeakSet<any> = _seen ?? new WeakSet();

  if (Array.isArray(val)) {
    return val.map(v => isObject(v) ? normalizeObjectRecursively(v, seen) : v) as unknown as T;
  } else if (isObject(val)) {
    return normalizeObjectRecursively(val, seen);
  } else {
    return val;
  }
}

function isObject(val: unknown): val is Record<string, any> {
  return val !== null && typeof val === 'object' && !Array.isArray(val);
}

//function isArray(val: unknown): val is unknown[] {
//  return val !== null && typeof val === 'object' && Array.isArray(val);
//}
