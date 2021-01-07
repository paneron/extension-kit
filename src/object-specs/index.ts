import path from 'path';
import { ObjectSpec, SerializableObjectSpec } from '../types/object-spec';
import { JSONFileSpec, KnownBinaryFileSpec, TextFileSpec, YAMLFileSpec } from './basic';
export { SerializableObjectSpec };


export const DEFAULT_SPECS: SerializableObjectSpec[] = [
  YAMLFileSpec,
  JSONFileSpec,
  KnownBinaryFileSpec,
  TextFileSpec,
];


export function matchesPath(p: string, rule: ObjectSpec["matches"]): boolean {
  // Match by default
  let matched: boolean = true;

  // Narrow by path prefix
  if (matched && rule.pathPrefix) {
    matched = matched && p.startsWith(rule.pathPrefix);
  }

  // Narrow by extension
  if (rule.extensions) {
    let extensionMatched: boolean = false;
    for (const ext of rule.extensions) {
      extensionMatched = path.extname(p) === ext;
    }
    matched = extensionMatched;
  }

  // Narrow by path-matching function
  if (matched && rule.path) {
    matched = matched && rule.path(p);
  }

  return matched;
}
