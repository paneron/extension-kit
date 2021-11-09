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
  pid: number
  opts: BinaryInvocationRequest
  stdout: string
  stderr: string
  termination?: ProcessTerminationMetadata
}

export interface ProcessTerminationMetadata {
  code: number | null;
  signal: string | null;
  error: string | null;
}
