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
}

export interface SubprocessDescription {
  /** Platform-specific process ID. */
  pid: number

  /** The original options subprocess had been invoked with. */
  opts: BinaryInvocationRequest

  /** What the called subprocess output. */
  stdout: string

  /** What the called subprocess emitted to error output. */
  stderr: string

  /** Termination result. */
  termination?: ProcessTerminationMetadata
}

export interface ProcessTerminationMetadata {
  /** Termination code, if any. */
  code: number | null;

  /** The signal subprocess was terminated with, if any. */
  signal: string | null;

  /** Error description, if any. */
  error: string | null;
}
