import type { PathMatcher } from '../types/object-spec';


export function matchesPath(p: string, rule: PathMatcher): boolean {
  // Match by default
  let matched: boolean = true;

  // Narrow by path prefix
  if (rule.pathPrefix) {
    matched = p.startsWith(rule.pathPrefix);
  }

  // Narrow by path-matching function
  if (matched && rule.path) {
    matched = matched && rule.path(p);
  }

  return matched;
}


export { findSerDesRuleForPath } from './ser-des';
