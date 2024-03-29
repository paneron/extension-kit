/**
 * Serialization/deserialization rules describe how physical buffers
 * are represented as JS structures at runtime.
 * 
 * This is Node-only code due to use of Buffer API.
 */

import {
  formatPointerInfo,
  type PointerInfo as LFSPointerInfo,
  readPointerInfo,
} from '@riboseinc/isogit-lfs/pointers';
import { pointsToLFS } from '@riboseinc/isogit-lfs/util';

import { MMELToText, textToMMEL } from '@paneron/libmmel';
import { type MMELModel } from '@paneron/libmmel/interface/model';

import { AtomicSerDesRuleName } from '../types/object-spec';
import type { SerDesRule, SerDesRuleName, SerDesRuleNameExtensionMap } from '../types/object-spec';
import type { OnlyJSON } from '../util';
import type { BufferDataset } from '../types/buffers';

import yaml from './yaml';


// Tools for working with buffers

const utf8Decoder = new TextDecoder('utf-8');
const utf8Encoder = new TextEncoder();

/** Takes bytes and outputs Base64. */
function base64Encoder(bytes: Uint8Array): string {
  return btoa(
    bytes.reduce((acc, current) => acc + String.fromCharCode(current), "")
  );
}

/**
 * Cross-platform separator for buffer path components.
 * Since buffer paths use POSIX format, this is a POSIX path separator.
 */
const sep = '/'  // path.posix.sep;

/** Returns whether buffer dataset has only one root buffer at `sep`. */
function isLeaf(buffers: BufferDataset) {
  return Object.keys(buffers).length === 1 && buffers[sep] !== undefined;
}

/**
 * Returns extension normalized to lower-case with leading dot,
 * or empty string if no extension could be determined.
 */
function getExt(str: string): string {
  const _str = str.trim();
  if (_str === '') { return _str; }
  const ext = _str.split('.').pop()?.toLowerCase() ?? '';
  if (!ext || ext === _str) { return ''; }
  return `.${ext}`;
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
  const extension = getExt(objPath);
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
    isLeaf(buffers) && pointsToLFS(buffers[sep]!),

  deserialize: (buffers) =>
    ({ lfsPointerInfo: readPointerInfo(buffers[sep]) }),
  serialize: (objectData) =>
    ({ [sep]: formatPointerInfo(objectData.lfsPointerInfo) }),
}

export const textFile: SerDesRule<{ asText: string }> = {
  worksForBufferDataset: isLeaf,
  deserialize: (buffers) =>
    ({ asText: utf8Decoder.decode(buffers[sep]) }),
  serialize: (objectData) =>
    ({ [sep]: utf8Encoder.encode(objectData.asText) }),
};


export const jsonFile: SerDesRule<OnlyJSON<Record<string, any>>> = {
  worksForPath: (path) => path.endsWith('.json'),
  worksForBufferDataset: isLeaf,
  deserialize: (buffers) => JSON.parse(utf8Decoder.decode(buffers[sep])),
  serialize: (data) => ({ [sep]: utf8Encoder.encode(JSON.stringify(data)) }),
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
    ({ [sep]: utf8Encoder.encode(yaml.dump(data)) }),
};


export const mmelFile: SerDesRule<OnlyJSON<Record<string, any>>> = {
  worksForPath: (path) => path.endsWith('.mmel'),
  worksForBufferDataset: isLeaf,
  deserialize: (buffers) => {
    const result: MMELModel = textToMMEL(utf8Decoder.decode(buffers[sep]));
    return result;
  },
  serialize: (data) =>
    ({ [sep]: utf8Encoder.encode(MMELToText(data as MMELModel)) }),
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
    KNOWN_BINARY_EXTENSIONS.has(getExt(objPath)),
  deserialize: (buffers) => ({
    binaryData: buffers[sep],
    asBase64: base64Encoder(buffers[sep]),
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
  [AtomicSerDesRuleName.mmelFile]: mmelFile,
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
