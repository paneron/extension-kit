import path from 'path';
import yaml from 'js-yaml';
import { SerDesRule, SerDesRuleName } from '../types/object-spec';
import { OnlyJSON } from '../util';


export const sep = path.posix.sep;
export const utf8Decoder = new TextDecoder('utf-8');


export const textFile: SerDesRule<{ asText: string }> = {
  id: SerDesRuleName.textFile,
  deserialize: (buffers) =>
    ({ asText: utf8Decoder.decode(buffers[sep]) }),
  serialize: (objectData) =>
    ({ sep: Buffer.from(objectData.asText, 'utf-8') }),
};


export const jsonFile: SerDesRule<OnlyJSON<Record<string, any>>> = {
  id: SerDesRuleName.jsonFile,
  deserialize: (buffers) => JSON.parse(utf8Decoder.decode(buffers[sep])),
  serialize: (data) => ({ sep: Buffer.from(JSON.stringify(data), 'utf8') }),
};


export const yamlFile: SerDesRule<OnlyJSON<Record<string, any>>> = {
  id: SerDesRuleName.yamlFile,
  deserialize: (buffers) =>
    yaml.load(utf8Decoder.decode(buffers[sep])),
  serialize: (data) =>
    ({ sep: Buffer.from(yaml.dump(data, { noRefs: true }), 'utf8') }),
}


export const binaryFile: SerDesRule<{ binaryData: Uint8Array; asBase64: string; }> = {
  id: SerDesRuleName.binaryFile,
  deserialize: (buffers) => ({
    binaryData: buffers[sep],
    asBase64: Buffer.from(buffers[sep]).toString('base64'),
  }),
  serialize: (data) =>
    ({ sep: data.binaryData }),
};
