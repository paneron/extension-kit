/** @jsx jsx */
/** @jsxFrag React.Fragment */

import React, { useContext, useEffect, useRef, useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { jsx, css } from '@emotion/react';
import styled from '@emotion/styled';
import { Tag, Colors, Tab, Tabs } from '@blueprintjs/core';
import Workspace, { WorkspaceProps } from '../Workspace';
import { SuperSidebarConfig } from './types';
import { SPECIAL_TAB_IDX, TabbedWorkspaceContext } from './context';
import { DetailTab, DetailTabTitle } from './detail';
import SuperSidebar from './SuperSidebar';


/**
 * Wraps Workspace, adding tabbed GUI features.
 * Use inside TabbedWorkspaceContextProvider.
 */
export interface TabbedWorkspaceProps<SidebarID extends string> {
  /**
   * Configuration for individual sidebars, keyed by internal sidebar ID.
   * If there is more than one sidebar, sidebar selector is shown.
   */
  sidebarConfig: SuperSidebarConfig<SidebarID>

  /**
   * Sidebar IDs as a list. This is used to order sidebars.
   * TODO: Eliminate in favor of using weights or another way of ordering?
   */
  sidebarIDs: readonly SidebarID[]

  /**
   * “Home” view shown by default when there are no tabs
   * or when explicitly invoked by the user.
   */
  newTabPrompt: JSX.Element

  /** Set global mode bar for the workspace. */
  globalMode?: WorkspaceProps['globalMode']

  /** Set the status bar for the workspace. */
  statusBar?: WorkspaceProps['statusBar']

  className?: string
}
const TabbedWorkspace: React.VoidFunctionComponent<TabbedWorkspaceProps<any>> =
function ({
  sidebarConfig,
  sidebarIDs,
  newTabPrompt,
  globalMode,
  statusBar,
  className,
}) {
  const { state, dispatch, protocolConfiguration, focusedTabURI } = useContext(TabbedWorkspaceContext);
  const focusedTabRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (focusedTabURI) {
        const [proto, path] = focusedTabURI.split(':');
        const title = await protocolConfiguration[proto]?.plainTitle?.(path);
        if (title) {
          setTitle(title);
        } else {
          setTitle(null);
        }
      } else {
        setTitle(null);
      }
    })();
  }, [focusedTabURI, JSON.stringify(protocolConfiguration)]);

  useEffect(() => {
    if (state.focusedTabIdx >= 0) {
      focusedTabRef.current?.scrollIntoView();
    }
  }, [state.focusedTabIdx]);

  const sidebar = useMemo(() => {
    return <SuperSidebar
      config={sidebarConfig}
      sidebarIDs={sidebarIDs}
      selectedSidebarID={sidebarIDs.length > 1
        ? state.selectedSidebarID
        : sidebarIDs[0]}
      onSelectSidebar={sidebarIDs.length > 1
        ? id => dispatch({ type: 'focus-sidebar', payload: { id } })
        : undefined}
    />
  }, [JSON.stringify(sidebarConfig), JSON.stringify(sidebarIDs), state.selectedSidebarID]);

  return (
    <Workspace className={className} sidebar={sidebar} globalMode={globalMode} statusBar={statusBar}>
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
              position: relative;

              background: ${Colors.GRAY1};

              /* Accommodate the new tab button, absolutely positioned */
              white-space: nowrap;
              padding-left: 72px;

              /* Remove spacing between tabs */
              > *:not(:last-child) {
                margin-right: 2px;
              }

              /* Hide horizontal scrollbar (overlaps with tab titles on macOS) */
              ::-webkit-scrollbar {
                height: 0px;
                background: transparent;
              }
            }
            .bp3-tab-indicator { display: none; }
            .bp3-tab {
              line-height: unset;
              position: unset;
              display: inline-block;
              overflow: visible;
            }
            .bp3-tab-panel {
              flex: 1;
              margin: 0;
              padding: 5px;
              position: relative;
              background: ${Colors.LIGHT_GRAY3};
            }
          `}>
        {title
          ? <Helmet>
              <title>{title}</title>
            </Helmet>
          : null}
        <Tab
          id={SPECIAL_TAB_IDX.new}
          title={
            <TabTitleButton
                minimal={state.focusedTabIdx !== SPECIAL_TAB_IDX.new}
                icon="home"
                css={css`
                  position: absolute;
                  bottom: 0;
                  left: 1px;
                  z-index: 10;
                `}>
              Home
            </TabTitleButton>
          }
          panel={newTabPrompt}
        />
        {(state.detailTabURIs ?? []).map((uri, idx) =>
          <Tab
            id={idx}
            key={uri}
            panel={<DetailTab uri={uri} />}
            title={
              <div css={css`height: 24px;`} ref={idx === state.focusedTabIdx ? focusedTabRef : undefined}>
                <TabTitleButton
                    interactive={idx !== state.focusedTabIdx}
                    minimal={idx !== state.focusedTabIdx}
                    onRemove={(evt: React.MouseEvent) => {
                      dispatch({ type: 'close-tab', payload: { idx }});
                      evt.stopPropagation();
                    }}>
                  <DetailTabTitle uri={uri} />
                </TabTitleButton>
              </div>
            }
          />
        )}
      </Tabs>
    </Workspace>
  );
};


const TabTitleButton = styled(Tag)`
  border-radius: 0;
  height: 24px;
  padding: 0 8px;
  color: ${({ minimal }) => minimal ? Colors.WHITE : Colors.BLACK} !important;
  ${({ minimal }) => minimal ? '' : `background: ${Colors.LIGHT_GRAY3}`} !important;
  box-shadow: unset;
`;


export default TabbedWorkspace;
