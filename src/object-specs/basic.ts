import yaml from 'js-yaml';
import { BinaryObjectSpec, SerializableObjectSpec } from '../types/object-spec';


const utf8Decoder = new TextDecoder('utf-8');


export const JSONFileSpec: SerializableObjectSpec = {
  matches: { extensions: ['.json'] },
  deserialize: (buffers) =>
    JSON.parse(utf8Decoder.decode(buffers['/'])),
  serialize: (data) =>
    ({ '/': Buffer.from(JSON.stringify(data), 'utf8') }),
};

export const YAMLFileSpec: SerializableObjectSpec = {
  matches: { extensions: ['.yaml', '.yml'] },
  deserialize: (buffers) =>
    yaml.load(utf8Decoder.decode(buffers['/'])),
  serialize: (data) =>
    ({ '/': Buffer.from(yaml.dump(data, { noRefs: true }), 'utf8') }),
};

export const PrefixedPathBinaryAssetSpec: BinaryObjectSpec = {
  matches: { pathPrefix: '/assets/' },
  deserialize: (buffers) =>
    ({ binaryData: buffers['/'], asBase64: Buffer.from(buffers['/']).toString('base64') }),
  serialize: (data) =>
    ({ '/': data.binaryData }),
};

export const KnownBinaryFileSpec: BinaryObjectSpec = {
  matches: { extensions: ['.jpg', '.jpeg', '.png', '.mp4', '.ai', '.eps'] },
  deserialize: (buffers) =>
    ({ binaryData: buffers['/'], asBase64: Buffer.from(buffers['/']).toString('base64') }),
  serialize: (data) =>
    ({ '/': data.binaryData }),
};
