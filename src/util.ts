import type { Progress } from './types/progress';


export type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];


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
export function normalizeObjectRecursively
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
    return val.map(v => isObject(v)
      ? normalizeObjectRecursively(v, seen)
      : v
    ) as unknown as T;
  } else if (isObject(val)) {
    return normalizeObjectRecursively(val, seen);
  } else {
    return val;
  }
}

/**
 * Returns true if given value is a regular object (‘hash’),
 * excluding “special” objects like dates etc.
 */
export function isObject(val: unknown): val is Record<string, any> {
  return (
    val !== null &&
    typeof val === 'object' &&
    !Array.isArray(val) &&
    // val?.constructor === Object && // normal objects fail this one in extensions
    val?.toString?.() === '[object Object]'
  );
}

//function isArray(val: unknown): val is unknown[] {
//  return val !== null && typeof val === 'object' && Array.isArray(val);
//}


export const BP4_RESET_CSS = `
  body, html {
    -webkit-font-smoothing: antialiased;
    font-family: -apple-system, BlinkMacSystemFont, avenir next, avenir, segoe ui, helvetica neue, helvetica, Ubuntu, roboto, noto, arial, sans-serif;
  }

  .filter-popover .bp4-popover2-content {
    border-radius: 0;
  }
  .bp4-overlay-backdrop.bp4-popover2-backdrop {
    background: rgba(0, 0, 0, .5);
  }

  .bp4-tag.bp4-interactive {
    cursor: default !important;
  }
  .bp4-tag-remove {
    cursor: default !important;
  }

  .bp4-input {
    /*
     * “middle”, specified by BP4, causes issues with inpout text <-> OL marker alignment.
     * This seems to have no side-effects.
     */
    vertical-align: unset;
  }
  .bp4-input:read-only {
    box-shadow: inset silver 1px -1px;
    background: none;
  }
  .bp4-dark .bp4-input:read-only {
    box-shadow: inset rgba(255, 255, 255, 0.2) 1px -1px;
  }
  .bp4-tree-node-caret {
    cursor: default !important;
  }

  .bp4-tree-node-content:hover {
    background: unset;
  }

  .bp4-html-select select {
    cursor: default !important;
  }

  .bp4-button {
    cursor: default !important;

  }

    .bp4-button:focus {
      outline: none;
    }

  .bp4-tab {
    cursor: default !important;
  }

  .bp4-menu-item {
    cursor: default;
  }

    .bp4-menu-item, .bp4-menu .bp4-menu-item.bp4-disabled {
      cursor: default !important;
    }
`;
