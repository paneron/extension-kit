/** @jsx jsx */
/** @jsxFrag React.Fragment */

import React, { useContext, useEffect, useRef } from 'react';
import { jsx, css } from '@emotion/react';
import styled from '@emotion/styled';
import { Button, ButtonGroup, Colors, NonIdealState, Tab, Tabs } from '@blueprintjs/core';
import { SPECIAL_TAB_IDX } from './context';
import { TabbedWorkspaceContext } from './context';
import Workspace from '../Workspace';
import { ProtocolRegistry } from './types';
import { DetailTab, DetailTabTitle } from './detail';


export interface TabbedWorkspaceProps<Protocol extends string> {
  stateKey: string
  protoConfig: ProtocolRegistry<Protocol>
}

const TabbedWorkspace: React.FC<{ className?: string, sidebar?: JSX.Element}> = function ({
  className,
  sidebar,
}) {
  const { state, dispatch } = useContext(TabbedWorkspaceContext);
  const focusedTabRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (state.focusedTabIdx >= 0) {
      focusedTabRef.current?.scrollIntoView();
    }
  }, [state.focusedTabIdx]);

  return (
    <Workspace
        css={css`
          flex: 1 1 auto;
        `}
        className={className}
        sidebar={sidebar}>
      <Tabs
          id="detailTabs"
          selectedTabId={state.focusedTabIdx}
          onChange={(idx: number, oldIdx: number) => dispatch({ type: 'focus-tab', payload: { idx } })}
          css={css`
            background: ${Colors.LIGHT_GRAY2};
            flex: 1;
            display: flex;
            flex-flow: column nowrap;

            position: relative;

            .bp3-tab-list {
              overflow-x: auto;
              height: 24px;
              position: unset;

              /* Accommodate the new tab button on the right */
              display: block;
              white-space: nowrap;
              padding-right: 24px;

              /* Remove spacing between tabs */
              > *:not(:last-child) {
                margin-right: 0;
              }

              /* Hide horizontal scrollbar (overlaps with tab titles on macOS) */
              ::-webkit-scrollbar {
                height: 0px;
                background: transparent;
              }
            }
            .bp3-tab-indicator { display: none; }
            .bp3-tab { line-height: unset; position: unset; display: inline-block; }
            .bp3-tab-panel { flex: 1; margin: 0; padding: 5px; background: white; position: relative; }
          `}>
        <Tab
          id={SPECIAL_TAB_IDX.new}
          title={
            <TabTitleButton
              active={state.focusedTabIdx === SPECIAL_TAB_IDX.new}
              intent={state.focusedTabIdx === SPECIAL_TAB_IDX.new ? 'primary' : undefined}
              small
              icon="plus"
              css={css`position: absolute; top: 0; right: 0; z-index: 10;`}
            />
          }
          panel={<NonIdealState icon="menu-open" title="New tab" />}
        />
        {(state.detailTabURIs ?? []).map((uri, idx) =>
          <Tab
            id={idx}
            key={uri}
            panel={<DetailTab uri={uri} />}
            title={
              <ButtonGroup
                  css={css`
                    & > :last-child {
                      opacity: 0;
                      transition: opacity .2s linear;
                    }
                    &:hover {
                      & > :last-child {
                        opacity: 1;
                      }
                    }`}>
                <TabTitleButton
                    small
                    intent={idx === state.focusedTabIdx ? 'primary' : undefined}
                    active={idx === state.focusedTabIdx}>
                  <DetailTabTitle uri={uri} />
                </TabTitleButton>

                {/* A handle for scrolling this tab handle into view, when e.g. a new tab is opened outside of the scroll view. */}
                <div ref={idx === state.focusedTabIdx ? focusedTabRef : undefined} />

                <TabTitleButton
                  small
                  minimal
                  icon="cross"
                  onClick={(evt: React.MouseEvent) => {
                    dispatch({ type: 'close-tab', payload: { idx }});
                    evt.stopPropagation();
                  }}
                />
              </ButtonGroup>
            }
          />
        )}
      </Tabs>
    </Workspace>
  );
};


const TabTitleButton = styled(Button)`
  border-radius: 0;
`;


export default TabbedWorkspace;