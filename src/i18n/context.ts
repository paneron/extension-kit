import React from 'react';

import { SupportedLanguages, LangConfig } from './types';


export interface I18nConfigContextSpec extends LangConfig {
  available: SupportedLanguages,
  default: keyof SupportedLanguages & string,
  selected: keyof SupportedLanguages & string,
  select(id: string): void,
}


export const I18nConfigContext = React.createContext<I18nConfigContextSpec>({
  available: { en: 'English', zh: 'Chinese', ru: 'Russian' },
  default: 'en' as const,
  selected: 'en',
  select: (id: string) => {},
});
