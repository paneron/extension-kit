import path from 'path';
import { SerializableObjectSpec, SerDesRuleName } from '../types/object-spec';



export const JSONFileSpec: SerializableObjectSpec = {
  serDesRule: SerDesRuleName.jsonFile,
  matches: { extensions: ['.json'] },
};


export const YAMLFileSpec: SerializableObjectSpec = {
  serDesRule: SerDesRuleName.yamlFile,
  matches: { extensions: ['.yaml', '.yml'] },
};


export const PrefixedPathBinaryAssetSpec: SerializableObjectSpec = {
  serDesRule: SerDesRuleName.binaryFile,
  matches: {
    pathPrefix: path.join(path.posix.sep, 'assets', path.posix.sep),
  },
};


export const TextFileSpec: SerializableObjectSpec = {
  serDesRule: SerDesRuleName.textFile,
  matches: {},
};


export const KnownBinaryFileSpec: SerializableObjectSpec = {
  serDesRule: SerDesRuleName.binaryFile,
  matches: {
    /* Incomplete list. */
    extensions: ['.jpg', '.jpeg', '.png', '.mp4', '.ai', '.eps'],
  },
};
