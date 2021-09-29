/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx, css } from '@emotion/react';
import React from 'react';
import { Colors, H6 } from '@blueprintjs/core';
import styled from '@emotion/styled';
import HelpTooltip from '../HelpTooltip';


interface PanelSeparatorProps {
  title?: JSX.Element | string
  tooltip?: JSX.Element | string
  className?: string
}
export const PanelSeparator: React.FC<PanelSeparatorProps> = function ({ title, tooltip, className }) {
  return (
    <>
      <hr
        css={css`
          border-color: ${Colors.LIGHT_GRAY4};
          border-style: solid;
          width: 100%;
          ${tooltip ? 'margin-bottom: 0;' : ''}
        `}
        className={className}
      />
      {title
        ? <StyledHeader>
            {title}
            {tooltip
              ? <>
                  &ensp;
                  <HelpTooltip content={tooltip} iconSize={10} />
                </>
              : null}
          </StyledHeader>
        : null}
    </>
  );
};


const StyledHeader = styled(H6)`
  background: ${Colors.LIGHT_GRAY4};
  color: ${Colors.GRAY3};
  display: inline-block;
  padding: 2px 5px;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 10px !important;
  line-height: 1.2;
  letter-spacing: -.04em;
`;


export default PanelSeparator;
