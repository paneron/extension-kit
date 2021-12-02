/**
 * Buffers describe physical data atoms.
 * A buffer is a raw binary blob
 * and in current implementation maps to a file on disk
 * (or an object in Git repo).
 * 
 * A buffer is associated with a path (in POSIX format)
 * that describes its place in data repository tree.
 * 
 * Multiple buffers may comprise a single logical **object**.
 */

import { Change, Changeset } from './changes';


export type BufferDataset = { [bufferPath: string]: Uint8Array | null };

export type BufferChange = Change<Uint8Array>;

export type BufferChangeset = Changeset<BufferChange>;
