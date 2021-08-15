export type Settings = Record<string, any>

export interface GlobalSettings extends Settings {
  sidebarPosition: 'left' | 'right'
}

export const INITIAL_GLOBAL_SETTINGS: GlobalSettings = {
  sidebarPosition: 'right',
};
