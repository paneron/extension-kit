import path from 'path';
import yaml from 'js-yaml';
import { BinaryObjectSpec, SerializableObjectSpec } from '../types/object-spec';


const sep = path.posix.sep;

const utf8Decoder = new TextDecoder('utf-8');


export const JSONFileSpec: SerializableObjectSpec = {
  matches: { extensions: ['.json'] },
  deserialize: (buffers) =>
    JSON.parse(utf8Decoder.decode(buffers[sep])),
  serialize: (data) =>
    ({ sep: Buffer.from(JSON.stringify(data), 'utf8') }),
};

export const YAMLFileSpec: SerializableObjectSpec = {
  matches: { extensions: ['.yaml', '.yml'] },
  deserialize: (buffers) =>
    yaml.load(utf8Decoder.decode(buffers[sep])),
  serialize: (data) =>
    ({ sep: Buffer.from(yaml.dump(data, { noRefs: true }), 'utf8') }),
};

export const PrefixedPathBinaryAssetSpec: BinaryObjectSpec = {
  matches: {
    pathPrefix: path.join(path.posix.sep, 'assets', path.posix.sep),
  },
  deserialize: (buffers) => ({
    binaryData: buffers[sep],
    asBase64: Buffer.from(buffers[sep]).toString('base64'),
  }),
  serialize: (data) =>
    ({ sep: data.binaryData }),
};

export const TextFileSpec: SerializableObjectSpec<{ asText: string }> = {
  matches: {},
  deserialize: (buffers) =>
    ({ asText: utf8Decoder.decode(buffers[sep]) }),
  serialize: (data) =>
    ({ sep: Buffer.from(data.asText, 'utf8') }),
};

export const KnownBinaryFileSpec: BinaryObjectSpec = {
  matches: {
    /* Incomplete list. */
    extensions: ['.jpg', '.jpeg', '.png', '.mp4', '.ai', '.eps'],
  },
  deserialize: (buffers) => ({
    binaryData: buffers[sep],
    asBase64: Buffer.from(buffers[sep]).toString('base64'),
  }),
  serialize: (data) =>
    ({ sep: data.binaryData }),
};
