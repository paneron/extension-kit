export type Settings = Record<string, any>

export interface GlobalSettings extends Settings {
  sidebarPosition: 'left' | 'right'
  mainNavbarPosition: 'top' | 'bottom'

  /** Theme to prefer, if `null` then use system theme. */
  defaultTheme: 'dark' | 'light' | null
}

export const INITIAL_GLOBAL_SETTINGS: GlobalSettings = {
  sidebarPosition: 'right',
  mainNavbarPosition: 'top',
  defaultTheme: 'light',
};


export function isValidGlobalSettings(val: any): val is GlobalSettings {
  return (
    val
    && ['left', 'right'].indexOf(val.sidebarPosition) >= 0
    && ['top', 'bottom'].indexOf(val.mainNavbarPosition) >= 0
    && ['dark', 'light', null].indexOf(val.defaultTheme) >= 0);
}
