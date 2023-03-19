/** @jsx jsx */
/** @jsxFrag React.Fragment */

import React from 'react';
import { jsx, css } from '@emotion/react';
import { Colors, Icon, InputGroupProps2, InputGroup, UL, HTMLSelect, HTMLSelectProps, Intent } from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';
import HelpTooltip from '../HelpTooltip';


interface PropertyViewProps {
  label: JSX.Element | string
  title?: string
  tooltip?: JSX.Element | string
  tooltipIntent?: Intent
  tooltipClassName?: string
  className?: string 
}
const PropertyView: React.FC<PropertyViewProps> =
function ({ label, title, tooltip, tooltipIntent, tooltipClassName, className, children }) {
  return (
    <div
        className={className}
        title={title}
        css={css`
          display: flex;
          flex-flow: row nowrap;
          align-items: flex-start;
          font-size: 12px;
          margin-bottom: 5px;
        `}>
      <div css={css`
            width: 40%;
            padding-right: 10px;
            text-align: right;
            padding-top: 2px;
            padding-bottom: 2px;
            color: ${Colors.GRAY1};
          `}>
        {tooltip
          ? <HelpTooltip
              content={tooltip}
              intent={tooltipIntent}
              tooltipProps={{ className: tooltipClassName }}
            />
          : null}
        {" "}
        {label}
      </div>
      <div css={css`
            width: 60%;
            word-break: break-all;
            line-height: 1.2;
            padding-top: 3px;
            padding-bottom: 2px;

            .bp4-input-group .bp4-input {
              margin-top: -5px;
              margin-bottom: -2px;
              font-size: unset;
              line-height: unset;
              border-radius: 0;
              height: 18px;
            }
          `}>
        {children}
      </div>
    </div>
  );
}


interface TextInputProps {
  value: string
  onChange?: (newValue: string) => void
  onConfirm?: () => void
  placeholder?: string
  inputGroupProps?: InputGroupProps2 
  validationErrors?: string[]
  className?: string
  style?: React.CSSProperties
}
export const TextInput: React.FC<TextInputProps> =
function ({ value, placeholder, onChange, validationErrors, inputGroupProps, className, style }) {
  const errs = validationErrors ?? [];
  const invalid = errs.length > 0;
  return (
    <InputGroup
      fill
      small
      disabled={!onChange}
      value={value}
      css={css`${invalid && onChange ? `.bp4-input { background: mistyrose }` : ''}`}
      placeholder={placeholder}
      rightElement={invalid
        ? <Tooltip2
              position="right"
              intent="danger"
              minimal
              content={
                <UL css={css`margin: 0;`}>
                  {errs.map((err, idx) => <li key={idx}>{err}</li>)}
                </UL>
              }>
            <Icon
              icon="warning-sign"
              iconSize={10}
              intent="danger"
              css={css`margin-right: 5px; margin-bottom: 2.5px`}
            />
          </Tooltip2>
        : undefined}
      {...inputGroupProps}
      onChange={onChange ? (evt: React.FormEvent<HTMLInputElement>) => onChange!(evt.currentTarget.value) : undefined}
      className={className}
      style={style}
    />
  )
}

interface SelectProps extends HTMLSelectProps {}
export const Select: React.FC<SelectProps> =
function ({ value, options, onChange, large, minimal, fill }) {
  return (
    <HTMLSelect
      options={options}
      onChange={onChange}
      disabled={!onChange}
      value={value}
      large={large}
      minimal={minimal}
      fill={fill}
      css={css`
        margin-top: -2px;
        & select {
          height: 18px;
          font-size: unset;
        }
        & .bp4-icon-double-caret-vertical {
          top: 2px;
        }
      `}
    />
  )
}


export default PropertyView;
