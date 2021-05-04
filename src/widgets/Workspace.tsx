/** @jsx jsx */
/** @jsxFrag React.Fragment */

/* Workspace has a main area, a sidebar, and a status bar with item count & possibly refresh & other actions. */

import { jsx, css } from '@emotion/core';
import React from 'react';
import ItemCount, { ItemCountProps } from './ItemCount';
import { Classes, Colors } from '@blueprintjs/core';


const Workspace: React.FC<{
  toolbar?: JSX.Element
  sidebar?: JSX.Element
  statusBarProps?: ItemCountProps
  className?: string
  style?: React.CSSProperties
}> = function ({ toolbar, sidebar, statusBarProps, className, style, children }) {
  return (
    <div css={css`display: flex; flex-flow: column nowrap; overflow: hidden;`} className={className} style={style}>
      <div css={css`flex: 1; display: flex; flex-flow: row nowrap; overflow: hidden;`}>
        <div css={css`flex: 1; display: flex; flex-flow: column nowrap; overflow: hidden;`}>
          {toolbar
            ? <div
                  css={css`
                    display: flex; flex-flow: row nowrap; align-items: center;
                    background: linear-gradient(to bottom, ${Colors.LIGHT_GRAY5}, ${Colors.LIGHT_GRAY4});
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
