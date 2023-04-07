import { BufferDataset } from './buffers';


/** Options supplied implicitly to the exporter. */
export interface ExportOptions {
  datasetRootPath: string
  onProgress?: (message: string) => void
}

/**
 * An exporter is a generator of buffer datasets.
 */
export type Exporter = AsyncGenerator<BufferDataset, never, void>;

/**
 * Prepares the exporter given configuration (progress handler, etc.).
 */
export type ExporterConstructor = (opts: ExportOptions) => Exporter;

export type ExporterModule =
  Promise<{ default: ExporterConstructor }>;
