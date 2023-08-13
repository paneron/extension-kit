import type { FileFilter } from './renderer';


/** Mimics Electron’s dialog options without having to import from Electron. */
export interface FSDialogProps {
  prompt: string
}

export interface OpenFileDialogProps extends FSDialogProps {
  filters?: FileFilter[]
  allowMultiple?: boolean
}

export interface SelectDirectoryProps extends FSDialogProps {
  prompt: string
}


export interface SaveFileDialogProps extends FSDialogProps {
  prompt: string

  /**
   * Pre-written path to save as.
   * Ideally, at least extension should be specified.
   */
  defaultPath?: string

  filters?: FileFilter[]
}
