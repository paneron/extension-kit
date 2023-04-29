/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx, css } from '@emotion/react';
import styled from '@emotion/styled';
import React from 'react';
import { Classes, Colors, TagProps, Tag } from '@blueprintjs/core';
import Navbar, { NavbarProps }from './Navbar';


/**
 * Workspace has a main area, a sidebar,
 * and a status bar with item count & possibly refresh & other actions.
 */
export interface WorkspaceProps {
  /** What to show in the sidebar. */
  sidebar?: JSX.Element
  sidebarPosition?: 'left' | 'right'

  /** Global mode bar. Use sparingly. */
  globalMode?: {
    content: JSX.Element
    intent: TagProps["intent"]
    icon?: TagProps["icon"]
    onClick?: () => void
  }

  // These may be obsolete.
  navbarProps?: NavbarProps
  toolbar?: JSX.Element

  /** Status bar, shown on the bottom. Should not be turned on or off willy-nilly. */
  statusBar?:
    | { content: JSX.Element, items?: never }
    | { content?: never, items: { id: string, content: JSX.Element, flex?: true }[] }

  className?: string
  style?: React.CSSProperties
}
const Workspace: React.FC<WorkspaceProps> = function ({
  navbarProps,
  globalMode,
  toolbar,
  sidebar,
  sidebarPosition,
  statusBar,
  className,
  style,
  children,
}) {
  return (
    <div
        css={css`
          display: flex;
          flex-flow: column nowrap;
          overflow: hidden;
          background: ${Colors.LIGHT_GRAY2};
          .bp4-dark & { background: ${Colors.DARK_GRAY2}; color: ${Colors.LIGHT_GRAY4}; }
          margin-top: ${globalMode ? '0' : '-20px'};
        `}
        className={className}
        style={style}>
      <Bar
          css={css`
            position: relative;
            opacity: ${globalMode ? '1' : '0'};
            transition: opacity .8s;
          `}
          interactive={globalMode?.onClick !== undefined}
          onClick={globalMode?.onClick}
          icon={globalMode?.icon}
          intent={globalMode?.intent}>
        {globalMode?.content ?? ' '}
      </Bar>
      <div css={css`flex: 1; display: flex; flex-flow: ${sidebarPosition === 'left' ? 'row-reverse' : 'row'} nowrap; overflow: hidden;`}>
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
                    .bp4-dark & { background: ${Colors.GRAY3}; color: ${Colors.LIGHT_GRAY4}; }
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

      {statusBar
        ? <Bar
            className={Classes.ELEVATION_2}
            css={css`
              display: flex;
              flex-flow: row nowrap;
              align-items: stretch;
              background: ${Colors.LIGHT_GRAY1};
              color: ${Colors.GRAY2};
              .bp4-dark & {
                background: ${Colors.DARK_GRAY1};
                color: ${Colors.LIGHT_GRAY2};
              }
          `}>
            {statusBar.content ?? statusBar.items.map(i =>
              <span key={i.id} css={css`${i.flex ? 'flex: 1;' : 'flex: 0;'}`}>
                {i.content}
              </span>
            )}
          </Bar>
        : null}
    </div>
  );
}

const Bar = styled(Tag)`
  border-radius: 0;
`;


export default Workspace;
