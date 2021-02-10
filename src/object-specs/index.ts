import path from 'path';
import { SerializableObjectSpec } from '../types/object-spec';
import { JSONFileSpec, KnownBinaryFileSpec, TextFileSpec, YAMLFileSpec } from './basic';


export const DEFAULT_SPECS: SerializableObjectSpec[] = [
  YAMLFileSpec,
  JSONFileSpec,
  KnownBinaryFileSpec,
  TextFileSpec,
];


export function matchesPath(p: string, rule: SerializableObjectSpec["matches"]): boolean {
  // Match by default
  let matched: boolean = true;

  // Narrow by path prefix
  if (rule.pathPrefix) {
    matched = p.startsWith(rule.pathPrefix);
  }

  // Narrow by extension
  if (matched && rule.extensions) {
    let extensionMatched: boolean = false;
    for (const ext of rule.extensions) {
      extensionMatched = path.extname(p) === ext;
      if (extensionMatched) {
        break;
      }
    }
    matched = matched && extensionMatched;
  }

  // Narrow by path-matching function
  if (matched && rule.path) {
    const func = new Function('bufferPath', rule.path);
    matched = matched && func(p);
  }

  return matched;
}


export { SerializableObjectSpec };
