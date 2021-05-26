import * as yaml from 'js-yaml';
import { customTimestampType } from './custom-timestamp';
import { customBoolType } from './custom-bool';


/* This schema adds timestamp parsing and adjusts boolean parsing. */
const schema = yaml.DEFAULT_SCHEMA.extend({
  // Trick because js-yaml API appears to not support augmenting implicit tags
  implicit: [
    ...(yaml.DEFAULT_SCHEMA as any).implicit,
    ...[customTimestampType, customBoolType],
  ],
});

export default schema;
