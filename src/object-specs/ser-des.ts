/* Serialization/deserialization rules describe how physical buffers
   are represented as JS structures at runtime.
*/

import path from 'path';
import {
  SerDesRule,
  AtomicSerDesRuleName,
  CompositeSerDesRuleName,
  SerDesRuleName,
} from '../types/object-spec';
import { OnlyJSON } from '../util';
import yaml from './yaml';
import { makePaneronObjectCompositeSerDesRule } from './paneron-object';


const sep = path.posix.sep;
const utf8Decoder = new TextDecoder('utf-8');


// Rule query API

export function findSerDesRuleForPath(objPath: string): SerDesRule {
  const extension = path.extname(objPath);
  const ruleName = rulesByExtension[extension] ?? DEFAULT_RULE;
  return getSerDesRuleByName(ruleName);
}

export function getSerDesRuleByName(ruleName: SerDesRuleName): SerDesRule {
  return SER_DES_RULE_REGISTRY[ruleName];
}


// Rule definitions

export const textFile: SerDesRule<{ asText: string }> = {
  deserialize: (buffers) =>
    ({ asText: utf8Decoder.decode(buffers[sep]) }),
  serialize: (objectData) =>
    ({ [sep]: Buffer.from(objectData.asText, 'utf-8') }),
};


export const jsonFile: SerDesRule<OnlyJSON<Record<string, any>>> = {
  deserialize: (buffers) => JSON.parse(utf8Decoder.decode(buffers[sep])),
  serialize: (data) => ({ [sep]: Buffer.from(JSON.stringify(data), 'utf8') }),
};


export const yamlFile: SerDesRule<OnlyJSON<Record<string, any>>> = {
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


export const binaryFile: SerDesRule<{ binaryData: Uint8Array; asBase64: string; }> = {
  deserialize: (buffers) => ({
    binaryData: buffers[sep],
    asBase64: Buffer.from(buffers[sep]).toString('base64'),
  }),
  serialize: (data) =>
    ({ [sep]: data.binaryData }),
};


// Rule registers

export const rulesByExtension: { [ext: string]: SerDesRuleName } = {
  '.json': AtomicSerDesRuleName.jsonFile,
  '.yaml': AtomicSerDesRuleName.yamlFile,
  '.yml': AtomicSerDesRuleName.yamlFile,
  '.jpg': AtomicSerDesRuleName.binaryFile,
  '.png': AtomicSerDesRuleName.binaryFile,
  '.wav': AtomicSerDesRuleName.binaryFile,
  '.ogg': AtomicSerDesRuleName.binaryFile,
  '.gif': AtomicSerDesRuleName.binaryFile,
  '.txt': AtomicSerDesRuleName.textFile,

  '.pan': CompositeSerDesRuleName.paneronObject,
  '': AtomicSerDesRuleName.textFile,
} as const;

const DEFAULT_RULE: SerDesRuleName = AtomicSerDesRuleName.textFile;

const ATOMIC_SER_DES_RULES: { [key in AtomicSerDesRuleName]: SerDesRule } = {
  [AtomicSerDesRuleName.jsonFile]: jsonFile,
  [AtomicSerDesRuleName.yamlFile]: yamlFile,
  [AtomicSerDesRuleName.binaryFile]: binaryFile,
  [AtomicSerDesRuleName.textFile]: textFile,
};

const SER_DES_RULE_REGISTRY: { [key in SerDesRuleName]: SerDesRule } = {
  ...ATOMIC_SER_DES_RULES,
  [CompositeSerDesRuleName.paneronObject]: makePaneronObjectCompositeSerDesRule(),
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
