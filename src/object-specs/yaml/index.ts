import yaml from 'js-yaml';
import schema from './schema';

/**
 * A wrapper around js-yaml that supplies noRefs & schema options,
 * and is supposed to handle specifically dictionaries/objects.
 */
export default {
  dump: (data: Record<string, any>): string => yaml.dump(data, { schema, noRefs: true }),
  load: <T extends Record<string, any>>(rawData: string): T => {
    const result = yaml.load(rawData, { schema });
    //console.debug("yaml.load: deserialized", rawData, "as", result, "/", JSON.stringify(result));
    if (result && typeof result !== 'string' && typeof result !== 'number') {
      return result as T;
    } else {
      throw new Error("Failed to load YAML buffer data: got a non-object from js-yaml’s load()");
    }
  },
};
