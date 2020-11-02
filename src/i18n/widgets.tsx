import React, { useContext } from 'react';
import { Button, ButtonGroup, IButtonGroupProps, IButtonProps } from '@blueprintjs/core';
import { Translatable } from './types';
import { I18nConfigContext } from './context';


interface TranslatableComponentProps {
  what: Translatable<string>
}
export const Trans: React.FC<TranslatableComponentProps> = function ({ what }) {
  const i18n = useContext(I18nConfigContext);
  const translated = what[i18n.selected];
  const untranslated = what[i18n.default];

  return <span>{translated || untranslated || '(malformed translatable string)'}</span>;
};


interface LangSelectorProps {
  value?: Translatable<any>
  groupProps?: IButtonGroupProps
  exclude?: string[]
  untranslatedProps?: IButtonProps
  translatedProps?: IButtonProps
}
export const LangSelector: React.FC<LangSelectorProps> =
function ({ exclude, value, untranslatedProps, translatedProps, groupProps }) {
  const i18n = useContext(I18nConfigContext);

  return (
    <ButtonGroup {...groupProps}>
      {Object.keys(i18n.available).
          filter(langID => (exclude || []).indexOf(langID) < 0).
          map(langId =>
        <LangSelectorButton
          key={langId}
          id={langId}
          title={i18n.available[langId]}
          isSelected={langId === i18n.selected}
          onSelect={() => i18n.select(langId)}
          untranslatedProps={untranslatedProps}
          translatedProps={translatedProps}
          hasTranslation={(value !== undefined) ? (value[langId] !== undefined) : undefined}
        />
      )}
    </ButtonGroup>
  );
};


interface LangSelectorButtonProps {
  id: string
  title: string
  isSelected: boolean
  onSelect: () => void
  hasTranslation?: boolean
  untranslatedProps?: IButtonProps
  translatedProps?: IButtonProps
}
const LangSelectorButton: React.FC<LangSelectorButtonProps> = function (props) {
  return (
    <Button
        active={props.isSelected}
        onClick={props.onSelect}
        {...(!props.hasTranslation ? props.untranslatedProps : {})}
        {...(props.hasTranslation ? props.translatedProps : {})}>
      {props.id}
    </Button>
  );
};
