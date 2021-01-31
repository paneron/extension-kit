export function stripLeadingSlash(fp: string): string {
  return fp.replace(/^\//, '');
}

export const encoder = new TextEncoder();

export const decoder = new TextDecoder('utf-8');
