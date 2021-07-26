// Extension points

import type { SidebarBlockConfig } from "./widgets/Sidebar/Block";

type FileView = React.FC<{ fileData: Record<string, any> }>
interface FileViewConfiguration {
  label: string
  View: FileView // Block
}
interface RecognizedFileType {
  title: string
  description?: string
  listItemView?: FileView // Inline
}
const availableFileHandlers: { [fnExt: string]: { [extID: string]: RecognizedFileType } } = {};
const defaultFileHandlers: { [fnExt: string]: RecognizedFileType & { extID: string } } = {};
const fileViewRegistry: { [fnExt: string]: (FileViewConfiguration & { extID: string })[] } = {};

interface Setting<T> {
  label: string
  description?: string
  helperText?: JSX.Element
  View: React.FC<{ val: T, onChange?: (newVal: T) => void }>
}
const settingRegistry: { [settingIDNamespacedByExtensionID: string]: Setting<any> } = {};

interface Sidebar {
  title: string
  description?: string
  TitleView: React.FC<Record<never, never>> // Inline
  View: React.FC<Record<never, never>> // Block
  blocks: SidebarBlockConfig[]
}
const sidebarRegistry: { [sidebarID: string]: Sidebar } = {};


// Callbacks are used by Paneron to update extension areas in GUI.
interface Callbacks {
  sidebarsUpdated: () => void,
  fileHandlersUpdated: () => void,
  settingsUpdated: () => void,
}
const callbacks: Callbacks = {
  sidebarsUpdated: () => void 0,
  fileHandlersUpdated: () => void 0,
  settingsUpdated: () => void 0,
}

type ChangeHandler = (changeset: FileChangeset) => Promise<FileChangeset>;


// This API can be called by the extension.
interface Register {
  contributeDatasetSupport: (extID: string, changeHandler: ChangeHandler) => void
  //registerChangeHandler: (extID: string, handler: ChangeHandler) => void

  contributeSetting: <T>(extID: string, scopedSettingID: string, setting: Setting<T>) => void
  contributeFileHandler: (extID: string, fnExt: string, handler: RecognizedFileType) => void
  contributeSidebar: (extID: string, scopedSidebarID: string, sidebar: Sidebar) => void
  contributeSidebarBlock: (extID: string, targetSidebarID: string, blockID: string, block: SidebarBlockConfig) => void
  contributeSearchCriteria: (extID: string, criteria: CriteriaConfiguration) => void
}
const registerAPI: Register = {
  contributeSidebar: function (extID, scopedSidebarID, sidebar) {
    sidebarRegistry[`${extID}.${scopedSidebarID}`] = sidebar;
    callbacks.sidebarsUpdated();
  },
  contributeFileHandler: function (extID, fnExt, handler) {
    fileHandlerRegistry[fnExt] ??= [];
    fileHandlerRegistry[fnExt].push(handler);
  },
}

// This is used by Paneron.
export const internalAPI: {
  registerCallback: (id: keyof Callbacks, cb: () => void) => void
  // Called during app initialization.

  deregisterExtension: (extID: string) => void
  // Called during uninstallation

  getSettings: () => Setting<any>[]
  getFileHandlers: (fnExt: string) => RecognizedFileType[]
  getSidebars: () => Sidebar[]
  getChangeHandler: (extID: string) => ChangeHandler
} = {
  registerCallback: function (id, cb) {
    callbacks[id] = cb;
  },
  deregisterExtension: function (extID) {
    for (const [fnExt, views] of Object.entries(fileViewRegistry)) {
      fileViewRegistry[fnExt] = views.filter(h => h.extID !== extID);
    }
    callbacks.fileHandlersUpdated();

    for (const settingID of Object.keys(settingRegistry)) {
      if (settingID.startsWith(`${extID}.`)) {
        delete settingRegistry[settingID];
      }
    }
    callbacks.settingsUpdated();

    for (const sidebarID of Object.keys(sidebarRegistry)) {
      if (sidebarID.startsWith(`${extID}.`)) {
        delete sidebarRegistry[sidebarID];
      } else {
        const { blocks } = sidebarRegistry[sidebarID];
        sidebarRegistry[sidebarID].blocks = blocks.filter(blockCfg => !blockCfg.key.startsWith(`${extID}.`));
      }
    }
    callbacks.sidebarsUpdated();
  }
};

export default registerAPI;
