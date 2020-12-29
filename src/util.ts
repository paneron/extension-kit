export function stripLeadingSlash(fp: string): string {
  return fp.replace(/^\//, '');
}
