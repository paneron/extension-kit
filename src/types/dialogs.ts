import type { FileFilter } from './renderer';


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
  defaultPath?: string
  filters?: FileFilter[]
}
