/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { Button, Classes, Colors } from '@blueprintjs/core';
import { jsx, css } from '@emotion/react';
import React from 'react';


export interface SidebarBlockConfig {
  key: string
  title: string | JSX.Element
  content: JSX.Element
  nonCollapsible?: boolean
  collapsedByDefault?: boolean
  height?: number // Height in pixels.
}


interface SidebarBlockProps {
  block: SidebarBlockConfig
  onExpand?: () => void
  onCollapse?: () => void
  expanded?: boolean
  className?: string
}


const SidebarBlock: React.FC<SidebarBlockProps> =
function ({ expanded, onExpand, onCollapse, block, className }) {
  return (
    <div css={css`
          display: flex; flex-flow: column nowrap; background: ${Colors.LIGHT_GRAY2};
        `}
        className={`${block.nonCollapsible !== true ? Classes.ELEVATION_1 : undefined} ${className ?? ''}`}>
      {block.nonCollapsible !== true
        ? <div
              onClick={expanded ? onCollapse : onExpand}
              css={css`
                height: 24px; overflow: hidden; background: linear-gradient(to top, ${Colors.LIGHT_GRAY2}, ${Colors.LIGHT_GRAY3});
                display: flex; flex-flow: row nowrap; align-items: center;
                font-variation-settings: 'GRAD' 600, 'opsz' 20;
                color: ${Colors.GRAY2};
                text-shadow: 1px 1px 1px ${Colors.LIGHT_GRAY5};
              `}>
            <div css={css`flex: 1; font-size: 90%; padding: 5px 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`}>
              {block.title}
            </div>
            <Button minimal disabled icon={expanded ? 'expand-all' : 'collapse-all'} />
          </div>
        : null}
      {expanded
        ? <div css={css`
                overflow-x: hidden; overflow-y: auto;
                padding: 5px;
                position: relative;
                ${block.height ? `height: ${block.height}px;` : '' }
                background: ${Colors.LIGHT_GRAY4};
                flex: 1 1 auto;
                line-height: 1.4;
                font-size: 90%;
              `}>
            {block.content}
          </div>
        : null}
    </div>
  );
}


export default SidebarBlock;
