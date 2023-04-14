import type { BufferDataset } from './buffers';
import type { DatasetContext } from './renderer';


/** Options supplied implicitly to the exporter. */
export interface ExportOptions {
  getObjectData: DatasetContext["getObjectData"]
  mapReduce: DatasetContext["getMapReducedData"]
  onProgress?: (message: string, loaded?: number, total?: number) => void
}

export interface ExportFormatInfo {
  name: string
  description: string
}

/**
 * An exporter is a generator of buffer datasets.
 */
export type Exporter = AsyncGenerator<BufferDataset, void, void>;

/**
 * Prepares exporter given configuration (progress handler, etc.).
 */
export type ExporterConstructor = (opts: ExportOptions) => Exporter;

export type ExporterModule =
  Promise<{ default: ExporterConstructor }>;
