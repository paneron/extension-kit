/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx, css } from '@emotion/react';
import React, { useContext } from 'react';
import { Classes, Colors } from '@blueprintjs/core';
import ItemCount, { ItemCountProps } from './ItemCount';
import Navbar, { NavbarProps }from './Navbar';
import { GlobalSettingsContext } from '../SettingsContext';


/**
 * Workspace has a main area, a sidebar,
 * and a status bar with item count & possibly refresh & other actions.
 */
export interface WorkspaceProps {
  /** What to show in the sidebar. */
  sidebar?: JSX.Element

  // These may be obsolete.
  navbarProps?: NavbarProps
  toolbar?: JSX.Element
  statusBarProps?: ItemCountProps

  className?: string
  style?: React.CSSProperties
}
const Workspace: React.FC<WorkspaceProps> = function ({
  navbarProps,
  toolbar,
  sidebar,
  statusBarProps,
  className,
  style,
  children,
}) {
  const { settings } = useContext(GlobalSettingsContext);

  return (
    <div css={css`display: flex; flex-flow: column nowrap; overflow: hidden;`} className={className} style={style}>
      <div css={css`flex: 1; display: flex; flex-flow: ${settings.sidebarPosition === 'right' ? 'row' : 'row-reverse'} nowrap; overflow: hidden;`}>
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
                <Navbar css={css`flex: 1;`} {...navbarProps} />
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
