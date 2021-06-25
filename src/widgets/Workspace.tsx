/** @jsx jsx */
/** @jsxFrag React.Fragment */

/* Workspace has a main area, a sidebar, and a status bar with item count & possibly refresh & other actions. */

import { jsx, css } from '@emotion/react';
import React from 'react';
import { Button, ButtonGroup, Classes, Colors, Icon, IconName } from '@blueprintjs/core';
import ItemCount, { ItemCountProps } from './ItemCount';


const Workspace: React.FC<{
  navbarProps?: NavbarProps
  toolbar?: JSX.Element
  sidebar?: JSX.Element
  statusBarProps?: ItemCountProps
  className?: string
  style?: React.CSSProperties
}> = function ({ navbarProps, toolbar, sidebar, statusBarProps, className, style, children }) {
  return (
    <div css={css`display: flex; flex-flow: column nowrap; overflow: hidden;`} className={className} style={style}>
      <div css={css`flex: 1; display: flex; flex-flow: row nowrap; overflow: hidden;`}>
        <div css={css`flex: 1; display: flex; flex-flow: column nowrap; overflow: hidden;`}>
          {navbarProps
            ? <div
                  css={css`
                    display: flex; flex-flow: row nowrap; align-items: center;
                    background: linear-gradient(to bottom, ${Colors.LIGHT_GRAY5}, ${Colors.LIGHT_GRAY4});
                    height: 24px;
                    overflow: hidden;
                    z-index: 5;
                  `}
                  className={Classes.ELEVATION_2}>
                <Navbar {...navbarProps} />
              </div>
            : null}

          {toolbar
            ? <div
                  css={css`
                    display: flex; flex-flow: row nowrap; align-items: center;
                    background: ${Colors.LIGHT_GRAY3};
                    height: 24px;
                    overflow: hidden;
                    z-index: 1;
                  `}
                  className={Classes.ELEVATION_1}>
                {toolbar}
              </div>
            : null}

          <div css={css`flex: 1; display: flex; flex-flow: column nowrap;`}>
            {children}
          </div>
        </div>

        {sidebar}
      </div>

      {statusBarProps
        ? <ItemCount
            css={css`font-size: 80%; height: 24px; padding: 0 10px; background: ${Colors.LIGHT_GRAY5}; z-index: 2;`}
            className={Classes.ELEVATION_2}
            {...statusBarProps} />
        : null}
    </div>
  );
}


export default Workspace;


interface BreadcrumbProps {
  label: JSX.Element
  icon?: IconName
  className?: string
}

interface NavbarProps {
  breadcrumbs: BreadcrumbProps[]
  onGoBack?: () => void
  onGoForward?: () => void
}

const Navbar: React.FC<NavbarProps> = function ({ breadcrumbs, onGoBack, onGoForward }) {
  return (
    <>
      <div
          css={css`
            flex: 1;
            box-sizing: border-box;
            display: flex; flex-flow: row nowrap; align-items: center;
            font-size: 80%; line-height: 0;
          `}>
        {breadcrumbs.map((crumb, idx) =>
          <React.Fragment key={idx}>
            <Breadcrumb {...crumb} />
            {idx !== breadcrumbs.length - 1
              ? <Icon icon="chevron-right" iconSize={10} key={idx} />
              : null}
          </React.Fragment>
        )}
      </div>
      <ButtonGroup>
        <Button disabled={!onGoBack} icon="arrow-left" title="Back" />
        <Button disabled={!onGoForward} icon="arrow-right" title="Forward" />
      </ButtonGroup>
    </>
  );
}

const Breadcrumb: React.FC<BreadcrumbProps> = function ({ className, label, icon }) {
  return (
    <div
      css={css`
          padding: 0 10px;
          display: flex;
          flex-flow: row nowrap;
          align-items: center;
          transform: skew(45deg);
        `}
      className={className}>

      {icon
        ? <div css={css`margin-right: .5rem;`}>
            {icon}
          </div>
        : null}

      {label}
    </div>
  );
}
