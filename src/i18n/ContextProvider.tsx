import React, { useState } from 'react';

import { SupportedLanguages } from './types';
import { I18nConfigContext } from './context';


export type I18nContextProviderProps<Languages extends SupportedLanguages> = {
  available: Languages
  default: keyof Languages
  selected: keyof Languages
};


const I18nContextProvider: React.FC<I18nContextProviderProps<any>> = function (props) {
  const [langConfig, setLangConfig] = useState({
    available: props.available,
    default: props.default as string,
    selected: props.selected as string,
    select: (langId: keyof typeof props.available) => {
      setLangConfig(langConfig => Object.assign({}, langConfig, { selected: langId }));
    },
  });

  return (
    <I18nConfigContext.Provider value={langConfig}>
      {props.children}
    </I18nConfigContext.Provider>
  );
};


export default I18nContextProvider;
