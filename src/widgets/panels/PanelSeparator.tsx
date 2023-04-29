/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx, css } from '@emotion/react';
import React from 'react';
import { Colors, H6 } from '@blueprintjs/core';
import styled from '@emotion/styled';
import HelpTooltip from '../HelpTooltip';


interface PanelSeparatorProps {
  title?: JSX.Element | string

  /** Has no effect if the `title` prop is omitted. */
  tooltip?: JSX.Element | string

  className?: string
  titleStyle?: React.CSSProperties
}
export const PanelSeparator: React.FC<PanelSeparatorProps> =
function ({ title, tooltip, className, titleStyle }) {
  return (title
    ? <StyledHeader style={titleStyle}>
        {title}
        {tooltip
          ? <>
              &ensp;
              <HelpTooltip content={tooltip} iconSize={10} />
            </>
          : null}
      </StyledHeader>
    : <hr
        css={css`
          width: 100%;
          border-style: solid;
          border-color: ${Colors.LIGHT_GRAY4};
          .bp4-dark & {
            border-color: ${Colors.DARK_GRAY4};
          }
        `}
        className={className}
      />);
};


const StyledHeader = styled(H6)`
  color: ${Colors.GRAY3};
  display: inline-block;
  padding: 2px 5px;
  margin-top: .5em;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 10px !important;
  line-height: 1.2;
  letter-spacing: -.04em;
`;


export default PanelSeparator;
