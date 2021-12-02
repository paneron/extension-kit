/**
 * Serialization/deserialization rules describe how physical buffers
 * are represented as JS structures at runtime.
 * 
 * This is Node-only code due to use of Buffer API.
 */

import path from 'path';

import {
  formatPointerInfo,
  PointerInfo as LFSPointerInfo,
  readPointerInfo,
} from '@riboseinc/isogit-lfs/pointers';
import { pointsToLFS } from '@riboseinc/isogit-lfs/util';

import {
  SerDesRule,
  AtomicSerDesRuleName,
  SerDesRuleName,
  SerDesRuleNameExtensionMap,
} from '../types/object-spec';
import type { OnlyJSON } from '../util';
import type { BufferDataset } from '../types/buffers';

import yaml from './yaml';


// Tools for working with buffers

const utf8Decoder = new TextDecoder('utf-8');

/**
 * Cross-platform separator for buffer path components.
 * Since buffer paths use POSIX format, this is a POSIX path separator.
 */
const sep = path.posix.sep;

/** Returns whether buffer dataset has only one root buffer at `sep`. */
function isLeaf(buffers: BufferDataset) {
  return Object.keys(buffers).length === 1 && buffers[sep] !== undefined;
}

// /**
//  * Returns whether buffer dataset looks like a tree.
//  * A tree won’t have root buffer path mapped to any contents.
//  */
// function isTree(buffers: BufferDataset) {
//   return Object.keys(buffers).length > 1 && buffers[sep] === undefined;
// }


// Rule query API

/**
 * Returns serialization/deserialization rule corresponding to given object path,
 * using provided extension map.
 */
function findSerDesRuleForExtension(objPath: string, map: SerDesRuleNameExtensionMap): SerDesRule | null {
  const extension = path.extname(objPath).toLowerCase();
  const ruleName = map[extension];
  return ruleName ? getSerDesRuleByName(ruleName) : null;
}


/** Returns serialization/deserialization rule that works for given object. */
export function findSerDesRuleForObject(
  objPath: string,
  obj: Record<string, any>,
  overrides?: { extensions?: SerDesRuleNameExtensionMap },
): SerDesRule {
  const override = overrides?.extensions
    ? findSerDesRuleForExtension(objPath, overrides.extensions)
    : null;
  if (override) return override;

  for (const rule of SER_DES_RULES) {
    if ((rule.worksForPath?.(objPath) ?? true) && (rule.worksForObject?.(obj) ?? true)) {
      return rule;
    }
  }
  return getSerDesRuleByName(DEFAULT_RULE);
}

/** Returns serialization/deserialization rule that works for given buffer dataset. */
export function findSerDesRuleForBuffers(
  objPath: string,
  buffers: BufferDataset,
  overrides?: { extensions?: SerDesRuleNameExtensionMap },
): SerDesRule {
  const override = overrides?.extensions
    ? findSerDesRuleForExtension(objPath, overrides.extensions)
    : null;
  if (override) return override;

  for (const rule of SER_DES_RULES) {
    if ((rule.worksForPath?.(objPath) ?? true) && (rule.worksForBufferDataset?.(buffers) ?? true)) {
      return rule;
    }
  }
  return getSerDesRuleByName(DEFAULT_RULE);
}

export function getSerDesRuleByName(ruleName: SerDesRuleName): SerDesRule {
  return SER_DES_RULE_REGISTRY[ruleName];
}


// Rule definitions

export const lfsPointer: SerDesRule<{ lfsPointerInfo: LFSPointerInfo }> = {
  worksForObject: (obj) => obj.lfsPointerInfo !== undefined,
  worksForBufferDataset: (buffers) =>
    isLeaf(buffers) && pointsToLFS(Buffer.from(buffers[sep]!)),

  deserialize: (buffers) =>
    ({ lfsPointerInfo: readPointerInfo(Buffer.from(buffers[sep])) }),
  serialize: (objectData) =>
    ({ [sep]: formatPointerInfo(objectData.lfsPointerInfo) }),
}

export const textFile: SerDesRule<{ asText: string }> = {
  worksForBufferDataset: isLeaf,
  deserialize: (buffers) =>
    ({ asText: utf8Decoder.decode(buffers[sep]) }),
  serialize: (objectData) =>
    ({ [sep]: Buffer.from(objectData.asText, 'utf-8') }),
};


export const jsonFile: SerDesRule<OnlyJSON<Record<string, any>>> = {
  worksForPath: (path) => path.endsWith('.json'),
  worksForBufferDataset: isLeaf,
  deserialize: (buffers) => JSON.parse(utf8Decoder.decode(buffers[sep])),
  serialize: (data) => ({ [sep]: Buffer.from(JSON.stringify(data), 'utf8') }),
};


export const yamlFile: SerDesRule<OnlyJSON<Record<string, any>>> = {
  worksForPath: (path) => path.endsWith('.yaml') || path.endsWith('.yml'),
  worksForBufferDataset: isLeaf,
  deserialize: (buffers) => {
    const result = yaml.load(utf8Decoder.decode(buffers[sep]));
    if (result && typeof result !== 'string' && typeof result !== 'number') {
      return result;
    } else {
      throw new Error("Failed to deserialize buffers: got a non-object from yaml.load()");
    }
  },
  serialize: (data) =>
    ({ [sep]: Buffer.from(yaml.dump(data), 'utf8') }),
};


const KNOWN_BINARY_EXTENSIONS: Set<string> = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.wav',
  '.ogg',
  '.mov',
  '.mp4',
  '.webm',
]);
export const binaryFile: SerDesRule<{ binaryData: Uint8Array; asBase64: string; }> = {
  worksForPath: (objPath) =>
    KNOWN_BINARY_EXTENSIONS.has(path.extname(objPath).toLowerCase()),
  deserialize: (buffers) => ({
    binaryData: buffers[sep],
    asBase64: Buffer.from(buffers[sep]).toString('base64'),
  }),
  serialize: (data) =>
    ({ [sep]: data.binaryData }),
};


// Rule registers

const DEFAULT_RULE: SerDesRuleName = AtomicSerDesRuleName.textFile;

const SER_DES_RULES: SerDesRule[] = [
  lfsPointer,
  // LFS pointer rule comes first. Any object/buffer can be a pointer
  // regardless of path.

  jsonFile,
  yamlFile,
  binaryFile,
  textFile,
];

const ATOMIC_SER_DES_RULES: { [key in AtomicSerDesRuleName]: SerDesRule } = {
  [AtomicSerDesRuleName.lfsPointer]: lfsPointer,
  [AtomicSerDesRuleName.jsonFile]: jsonFile,
  [AtomicSerDesRuleName.yamlFile]: yamlFile,
  [AtomicSerDesRuleName.binaryFile]: binaryFile,
  [AtomicSerDesRuleName.textFile]: textFile,
};

const SER_DES_RULE_REGISTRY: { [key in SerDesRuleName]: SerDesRule } = {
  ...ATOMIC_SER_DES_RULES,
  // [CompositeSerDesRuleName.paneronObject]: makePaneronObjectCompositeSerDesRule(),
};


//export function getAtomicSerDesRuleForExtension(ext: string): SerDesRule | undefined {
//  return Object.values(ATOMIC_SER_DES_RULES).find(rule =>
//    rule.extensions.indexOf(ext) >= 0 ||
//    Object.keys(rule.extensions).length === 0);
//}

//const EFFECTIVE_SER_DES_RULES: SerDesRuleName[] = [
//  AtomicSerDesRuleName.jsonFile,
//  AtomicSerDesRuleName.yamlFile,
//  AtomicSerDesRuleName.binaryFile,
//  AtomicSerDesRuleName.textFile,
//];

//export const SER_DES_RULES: { [key in SerDesRuleName]: SerDesRule } = {
//  ...ATOMIC_SER_DES_RULES,
//  //[NestedSerDesRuleName.tree]: makeTreeSerDesRule(ATOMIC_SER_DES_RULES),
//};
