export type BinaryInvocation = (opts: BinaryInvocationRequest) => ProcessHandle;

// Later we’ll support more structured way of invoking Metanorma, but for now it’s just using cliArgs.
export interface BinaryInvocationRequest {
  /** Path relative to Paneron’s bin directory. No extension, .exe will be auto-appended on Windows. */
  binaryName: string;

  /** Arguments will be concatenated. */
  cliArgs: string[];

  /**
   * If true, command is executed inside a shell.
   * In this case, no untrusted input should be passed to the command.
   */
  useShell?: true;

  /** Called when stdout is emitted. */
  onOut: (data: string) => void;

  /** Called when stderr is emitted. */
  onErr: (data: string) => void;

  /** Called when process sends a message. */
  onMessage: (data: any) => void;
}

interface ProcessTerminationMetadata {
  code: number | null;
  signal: string | null;
}

export interface ProcessHandle {
  /** Kills spawned process forcefully (equivalent of SIGKILL). */
  kill: () => void;

  /** Sends a message to spawned process. */
  sendMessage: (data: Object) => void;

  /** Resolves when process has terminated and its stdio closed. */
  termination: Promise<ProcessTerminationMetadata>;
}
