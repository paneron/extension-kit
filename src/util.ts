export function stripLeadingSlash(fp: string): string {
  return fp.replace(/^\//, '');
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
