/** @jsx jsx */
/** @jsxFrag React.Fragment */

import React, { useContext, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { jsx, css } from '@emotion/react';
import styled from '@emotion/styled';
import { Button, ButtonGroup, Colors, NonIdealState, Tab, Tabs } from '@blueprintjs/core';
import Workspace from '../Workspace';
import { SuperSidebarConfig } from './types';
import { SPECIAL_TAB_IDX, TabbedWorkspaceContext } from './context';
import { DetailTab, DetailTabTitle } from './detail';
import SuperSidebar from './SuperSidebar';


/**
 * Wraps Workspace, adding tabbed GUI features.
 * Use inside TabbedWorkspaceContextProvider.
 */
interface TabbedWorkspaceProps<SidebarID extends string> {
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

  className?: string
}
const TabbedWorkspace: React.VoidFunctionComponent<TabbedWorkspaceProps<any>> =
function ({
  sidebarConfig,
  sidebarIDs,
  newTabPrompt,
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
  }, [focusedTabURI]);

  useEffect(() => {
    if (state.focusedTabIdx >= 0) {
      focusedTabRef.current?.scrollIntoView();
    }
  }, [state.focusedTabIdx]);

  const sidebar = (
    <SuperSidebar
      config={sidebarConfig}
      sidebarIDs={sidebarIDs}
      selectedSidebarID={state.selectedSidebarID}
      onSelectSidebar={id => dispatch({ type: 'focus-sidebar', payload: { id } })}
    />
  );

  return (
    <Workspace className={className} sidebar={sidebar}>
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

              /* Accommodate the new tab button, absolutely positioned */
              display: block;
              white-space: nowrap;
              padding-left: 24px;

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
        {title
          ? <Helmet>
              <title>{title}</title>
            </Helmet>
          : null}
        <Tab
          id={SPECIAL_TAB_IDX.new}
          title={
            <TabTitleButton
              active={state.focusedTabIdx === SPECIAL_TAB_IDX.new}
              intent={state.focusedTabIdx === SPECIAL_TAB_IDX.new ? 'primary' : undefined}
              small
              icon="home"
              css={css`position: absolute; top: 0; left: 0; z-index: 10;`}
            />
          }
          panel={newTabPrompt}
        />
        {(state.detailTabURIs ?? []).map((uri, idx) =>
          <Tab
            id={idx}
            key={uri}
            panel={<DetailTab uri={uri} />}
            title={
              <ButtonGroup
                  css={css`
                    // styling “close tab” button:
                    & > :last-child {
                      opacity: 0;
                      transition: opacity .2s linear;
                      transform: translateX(-1px) scale(0.8);
                      transform-origin: left center;
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
                  outlined
                  intent="danger"
                  title={`Tab URI: ${uri}`}
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
