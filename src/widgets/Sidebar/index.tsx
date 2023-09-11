/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { Button, Classes, Colors } from '@blueprintjs/core';
import { jsx, css } from '@emotion/react';
import React, { useMemo, useCallback } from 'react';
import type { PersistentStateReducerHook } from '../../usePersistentStateReducer';
import SidebarBlock, { type SidebarBlockConfig } from './Block';
import BlockStateButtonGroup from './BlockStateButtonGroup';


interface State {
  blockState: { [blockTitle: string]: boolean } 
}

type Action =
  | { type: 'expand-all' | 'collapse-all' | 'reset-state' }
  | { type: 'collapse-one' | 'expand-one' | 'collapse-others', payload: { blockKey: string } };

export interface SidebarProps {
  stateKey: string
  title: string | JSX.Element
  blocks: SidebarBlockConfig[]

  representsSelection?: boolean
  /* Indicate via styling that sidebar is displaying details for a selected item. */

  className?: string 
}

function makeSidebar(
  persistentReducer: PersistentStateReducerHook<State, Action>,
) {
  const Sidebar: React.FC<SidebarProps> =
  function ({ title, stateKey, blocks, representsSelection, className }) {
    const withOtherBlocksCollapsed = useCallback((blockKey: string) => {
      return blocks.
        map(b => ({ [b.key]: b.nonCollapsible !== true && b.key !== blockKey ? false : true })).
        reduce((prev, curr) => ({ ...prev, ...curr }));
    }, [blocks]);

    const initialState: State = useMemo(() => ({
      blockState:
        blocks.
          map(b => ({ [b.key]: b.collapsedByDefault === true ? false : true })).
          reduce((prev, curr) => ({ ...prev, ...curr })),
    }), [blocks]);

    const [ state, dispatch, stateLoaded ] = persistentReducer(
      stateKey,
      undefined,
      undefined,
      (prevState, action) => {
        switch (action.type) {
          case 'expand-all':
            return { blockState: blocks.
              map(b => ({ [b.key]: true })).
              reduce((prev, curr) => ({ ...prev, ...curr })) };
          case 'collapse-all':
            return { blockState: blocks.
              map(b => ({ [b.key]: b.nonCollapsible !== true ? false : true })).
              reduce((prev, curr) => ({ ...prev, ...curr })) };
          case 'reset-state':
            return { blockState: blocks.
              map(b => ({ [b.key]: b.collapsedByDefault === true ? false : true })).
              reduce((prev, curr) => ({ ...prev, ...curr })) };
          case 'expand-one':
            return { blockState: { ...prevState.blockState, [action.payload.blockKey]: true } };
          case 'collapse-one':
            return { blockState: { ...prevState.blockState, [action.payload.blockKey]: false } };
          case 'collapse-others':
            return { blockState: withOtherBlocksCollapsed(action.payload.blockKey) };
          default:
            throw new Error("Unexpected sidebar state");
        }
      },
      initialState,
      null);

    function hasOthersCollapsed(blockKey: string): boolean {
      // Using JSON.stringify for quick and dirty object structure comparison.
      return JSON.stringify(withOtherBlocksCollapsed(blockKey)) === JSON.stringify(state.blockState);
    }

    const collapsibleBlocks = useMemo(
      () => blocks.filter(block => block.nonCollapsible !== true),
      [blocks]);

    const hasCollapsibleBlocks = collapsibleBlocks.length > 0;

    // Single blocks are styled so that they occupy the entire sidebar.
    const isSingleBlock = blocks.length === 1;

    return (
      <div
          css={css`display: flex; flex-flow: column nowrap;`}
          className={`${Classes.ELEVATION_1} ${className ?? ''}`}>
        <div css={css`
              height: 24px;
              background: ${representsSelection ? Colors.BLUE2 : Colors.GRAY1};
              .bp4-dark & { background: ${representsSelection ? Colors.BLUE1 : Colors.DARK_GRAY3}; }
              color: white; display: flex; flex-flow: row nowrap; align-items: center;
              overflow: hidden;
              font-variation-settings: 'GRAD' 500;
            `}>

          <div css={css`
                flex: 1;
                padding: 5px 10px;
                font-weight: bold; white-space: nowrap;
                overflow: hidden; text-overflow: ellipsis;
              `}>
            {title}
          </div>

          {hasCollapsibleBlocks
            ? <BlockStateButtonGroup>
                <Button
                  small
                  title="Expand all blocks"
                  icon="expand-all"
                  onClick={() => dispatch({ type: 'expand-all' })}
                />
                <Button
                  small
                  title="Collapse all blocks"
                  icon="collapse-all"
                  onClick={() => dispatch({ type: 'collapse-all' })}
                />
                <Button
                  small
                  title="Restore default collapsed state"
                  icon="reset"
                  onClick={() => dispatch({ type: 'reset-state' })}
                />
              </BlockStateButtonGroup>
            : null}
        </div>
        <div css={css`
              flex: 1;
              overflow-x: hidden;
              overflow-y: auto;
              position: relative;

              background: ${Colors.LIGHT_GRAY1};
              .bp4-dark & { background: ${Colors.DARK_GRAY3}; }
            `}>
          {stateLoaded
            ? <>
                {blocks.map((b, idx) =>
                  <SidebarBlock
                    key={idx}
                    css={css`${isSingleBlock
                      ? 'position: absolute; inset: 0;'
                      : ''}`}
                    expanded={isSingleBlock || b.nonCollapsible || state.blockState[b.key]}
                    block={b}
                    onCollapseOthers={
                      !isSingleBlock &&
                      collapsibleBlocks.filter(_b => _b.key !== b.key).length > 0 &&
                      !hasOthersCollapsed(b.key)
                        ? () => dispatch({ type: 'collapse-others', payload: { blockKey: b.key } })
                        : undefined
                    }
                    onCollapse={!isSingleBlock && b.nonCollapsible !== true && state.blockState[b.key]
                      ? () => dispatch({ type: 'collapse-one', payload: { blockKey: b.key } })
                      : undefined}
                    onExpand={!state.blockState[b.key] && b.nonCollapsible !== true
                      ? () => dispatch({ type: 'expand-one', payload: { blockKey: b.key } })
                      : undefined}
                  />
                )}
                <div css={css`
                  font-size: 40px;
                  text-align: center;
                  color: ${Colors.LIGHT_GRAY4};
                  .bp4-dark & { color: ${Colors.GRAY2}; }
                `}>— ❧ —</div>
              </>
            : null}
        </div>
      </div>
    );
  }

  return Sidebar;
}


export default makeSidebar;
