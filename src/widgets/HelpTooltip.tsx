/** @jsx jsx */
/** @jsxFrag React.Fragment */

import React from 'react';
import { ClassNames, jsx, css } from '@emotion/react';
import { Popover2InteractionKind, Tooltip2, Tooltip2Props } from '@blueprintjs/popover2';
import { Icon, IconSize, Intent } from '@blueprintjs/core';


export interface HelpTooltipProps {
  content: JSX.Element | string

  /** Applies to both icon and tooltip. */
  intent?: Intent

  /** Default: 12. */
  iconSize?: IconSize

  tooltipProps?: Partial<Tooltip2Props>
}

/** Info icon with a customized BP3 tooltip. */
const HelpTooltip: React.VoidFunctionComponent<HelpTooltipProps> =
function ({ content: tooltip, intent, iconSize, tooltipProps }) {
  return (
    <ClassNames>
      {({ css: css2, cx }) => (
        <Tooltip2
            popoverClassName={`${css2`
              margin: 10px;

              .bp3-popover2-content {
                font-size: 90%;
              }
            `}`}
            hoverCloseDelay={600}
            hoverOpenDelay={600}
            interactionKind={Popover2InteractionKind.HOVER}
            intent={intent}
            {...tooltipProps}
            css={css`
              cursor: help;
            `}
            renderTarget={({ ref, isOpen, ...targetProps }) => (
              <span
                  {...targetProps}
                  css={css`
                    display: inline-block;
                    padding: .15em;
                    margin: -.15em;
                    transition: opacity .2s linear;
                    ${isOpen ? 'opacity: 1;' : 'opacity: .3;'}
                  `}
                  ref={ref}>
                <Icon
                  icon="help"
                  intent={intent}
                  css={css`margin-bottom: 1px;`}
                  size={iconSize ?? 12}
                />
              </span>
            )}
            content={tooltip}>
        </Tooltip2>
      )}
    </ClassNames>
  );
};


export default HelpTooltip;
