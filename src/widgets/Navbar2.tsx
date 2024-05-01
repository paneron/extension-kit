/** @jsx jsx */
/** @jsxFrag React.Fragment */

import styled from '@emotion/styled';
import { jsx, css } from '@emotion/react';
import React, { useMemo } from 'react';
import { Colors, Icon, Button, type ButtonProps } from '@blueprintjs/core';


export interface NavProps {
  breadcrumbs: JSX.Element[]
  anchor: 'end' | 'start'
  className?: string
}


/**
 * Simple navbar.
 */
const Navbar: React.FC<NavProps> = function ({ breadcrumbs, anchor, children, className }) {
  const padding = anchor === 'end' ? '25px' : '15px';

  const breadcrumbsWithSeparators = useMemo(() => {
    return breadcrumbs.map((bc, idx) =>
      <React.Fragment key={idx}>
        {idx !== 0
          ? <BreadcrumbSeparator
              icon={anchor === 'end' ? "chevron-left" : "chevron-right"}
              iconSize={10}
            />
          : null}
        {bc}
      </React.Fragment>
    );
  }, [breadcrumbs]);

  return (
    <div
        css={css`
          display: flex; flex-flow: row nowrap; align-items: stretch;
          font-size: 80%;
          box-sizing: border-box;
          line-height: 0;
          padding: 0 ${padding};
          transition: width 1s linear;
          background: linear-gradient(to bottom, ${Colors.LIGHT_GRAY5}, ${Colors.LIGHT_GRAY3});
          .bp4-dark & {
            background: linear-gradient(to bottom, ${Colors.DARK_GRAY5}, ${Colors.DARK_GRAY3});
          }
          justify-content: ${anchor === 'end' ? 'flex-end' : 'flex-start'};
          transform: skew(-45deg);
        `}
        className={`${className ?? ''}`}>

      {breadcrumbsWithSeparators}

      <div css={css`
          ${anchor === 'start'
            ? css`position: absolute; right: ${padding};`
            : ''}
          `}>
        {children}
      </div>
    </div>
  );
};


const BreadcrumbSeparator = styled(Icon)`
  transform: skew(45deg);
  align-self: center;
`;


export const NavbarButton: React.FC<ButtonProps & { title?: string }> = function (props) {
  return <Button
    small
    minimal
    css={css`
      transform: skew(45deg);
      border-radius: 0;
      .bp4-icon {
        transform: scale(0.7);
      }
    `}
    {...props}
  />;
};


export default Navbar;
