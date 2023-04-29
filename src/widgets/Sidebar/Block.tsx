/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { Button, Classes, Colors } from '@blueprintjs/core';
import { jsx, css } from '@emotion/react';
import BlockStateButtonGroup from './BlockStateButtonGroup';
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
  onCollapseOthers?: () => void
  expanded?: boolean
  className?: string
}


const SidebarBlock: React.FC<SidebarBlockProps> =
function ({ expanded, onExpand, onCollapse, onCollapseOthers, block, className }) {
  return (
    <div css={css`
          display: flex; flex-flow: column nowrap; background: ${Colors.LIGHT_GRAY2};
        `}
        className={`${block.nonCollapsible !== true ? Classes.ELEVATION_1 : undefined} ${className ?? ''}`}>
      <div
          onClick={() => { expanded ? onCollapse?.() : onExpand?.() }}
          css={css`
            height: 24px; overflow: hidden;
            display: flex; flex-flow: row nowrap; align-items: center;
            font-variation-settings: 'GRAD' 600, 'opsz' 20;

            background: linear-gradient(to top, ${Colors.LIGHT_GRAY2}, ${Colors.LIGHT_GRAY3});
            color: ${Colors.GRAY2};
            text-shadow: 1px 1px 1px ${Colors.LIGHT_GRAY5};
            .bp4-dark & {
              background: linear-gradient(to top, ${Colors.GRAY1}, ${Colors.GRAY1});
              color: ${Colors.GRAY4};
              text-shadow: 1px 1px 1px ${Colors.GRAY1};
            }
          `}>
        <div
            css={css`
              flex: 1;
              font-size: 90%;
              padding: 5px 10px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            `}>
          {block.title}
        </div>
        {onCollapse || onExpand || onCollapseOthers
          ? <BlockStateButtonGroup>
              {onCollapseOthers
                ? <Button
                    minimal
                    small
                    icon='vertical-distribution'
                    title="Collapse other blocks"
                    onClick={(evt) => { evt.stopPropagation(); onCollapseOthers() }} />
                : null}
              {onCollapse
                ? <Button
                    minimal
                    small
                    icon='collapse-all'
                    title="Collapse this block"
                    onClick={(evt) => { evt.stopPropagation(); onCollapse() }} />
                : null}
              {onExpand
                ? <Button
                    minimal
                    small
                    icon='expand-all'
                    title="Expand this block"
                    onClick={(evt) => { evt.stopPropagation(); onExpand() }} />
                  : null}
            </BlockStateButtonGroup>
          : null}
      </div>
      {expanded
        ? <div css={css`
                overflow-x: hidden; overflow-y: auto;
                padding: 5px;
                position: relative;
                ${block.height ? `height: ${block.height}px;` : '' }
                background: ${Colors.LIGHT_GRAY4};
                .bp4-dark & { background: ${Colors.GRAY2}; }
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
