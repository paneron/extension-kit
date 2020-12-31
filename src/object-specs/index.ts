import { SerializableObjectSpec } from '../types/object-spec';
import { JSONFileSpec, KnownBinaryFileSpec, YAMLFileSpec } from './basic';


export const DEFAULT_SPECS: SerializableObjectSpec[] = [
  KnownBinaryFileSpec,
  YAMLFileSpec,
  JSONFileSpec,
];
