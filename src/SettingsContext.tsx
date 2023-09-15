import React from 'react';
import { type GlobalSettings, INITIAL_GLOBAL_SETTINGS } from './settings';


interface ContextSpec {
  settings: GlobalSettings
  refresh: () => void
}

export const GlobalSettingsContext = React.createContext<ContextSpec>({
  settings: INITIAL_GLOBAL_SETTINGS,
  refresh: () => void 0,
});
