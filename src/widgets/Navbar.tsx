/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx, css } from '@emotion/react';
import React from 'react';
import { Button, ButtonGroup, Icon, IconName } from '@blueprintjs/core';

export interface NavbarProps {
  breadcrumbs: BreadcrumbProps[];
  hideBackForwardNav?: true;
  onGoBack?: () => void;
  onGoForward?: () => void;
  className?: string
}

export const Navbar: React.FC<NavbarProps> =
function ({ breadcrumbs, onGoBack, onGoForward, hideBackForwardNav, className }) {
  return (
    <>
      <div
        className={className}
        css={css`
            box-sizing: border-box;
            display: flex; flex-flow: row nowrap; align-items: center;
            font-size: 80%; line-height: 0;
          `}>
        {breadcrumbs.map((crumb, idx) => <React.Fragment key={idx}>
          <Breadcrumb {...crumb} />
          {idx !== breadcrumbs.length - 1
            ? <Icon icon="chevron-right" iconSize={10} key={idx} />
            : null}
        </React.Fragment>
        )}
      </div>
      {!hideBackForwardNav
        ? <ButtonGroup>
          <Button disabled={!onGoBack} icon="arrow-left" title="Back" />
          <Button disabled={!onGoForward} icon="arrow-right" title="Forward" />
        </ButtonGroup>
        : null}
    </>
  );
};

export default Navbar;


interface BreadcrumbProps {
  label: JSX.Element;
  onNavigate?: () => void;
  icon?: IconName;
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = function ({ className, label, icon, onNavigate }) {
  return (
    <div
      css={css`
          padding: 0 10px;
          display: flex;
          flex-flow: row nowrap;
          align-items: center;
          ${onNavigate ? 'cursor: pointer;' : ''}
        `}
      onClick={onNavigate}
      className={className}>

      {icon
        ? <div css={css`margin-right: .5rem;`}>
          {icon}
        </div>
        : null}

      {label}
    </div>
  );
};
