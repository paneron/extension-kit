import type { BufferDataset } from './buffers';
import type { DatasetContext } from './renderer';


/** Options supplied implicitly to the exporter. */
export interface ExportOptions {
  getObjectData: DatasetContext["getObjectData"]
  onProgress?: (message: string, loaded?: number, total?: number) => void
}

/** Export format metadata. */
export interface ExportFormatInfo {
  name: string
  description: string
}

/** Export format configuration with the actual exporter function. */
export interface ExportFormatConfiguration extends ExportFormatInfo {
  exporter: ExporterConstructor;
}

/**
 * An exporter is a generator of buffer datasets.
 */
export type Exporter = AsyncGenerator<BufferDataset, void, void>;

/**
 * Prepares exporter given configuration (progress handler, etc.).
 */
export type ExporterConstructor = (opts: ExportOptions) => Exporter;
