/** @jsx jsx */
/** @jsxFrag React.Fragment */

import React, { useContext, useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { jsx, css } from '@emotion/react';
import styled from '@emotion/styled';
import { Tag, Colors, Tab, Tabs as BaseTabs } from '@blueprintjs/core';

import { normalizeObject } from '../../util';
import Workspace, { type WorkspaceProps } from '../Workspace';
import type { SuperSidebarConfig } from './types';
import { SPECIAL_TAB_IDX, TabbedWorkspaceContext } from './context';
import { DetailTab, DetailTabTitle } from './detail';
import SuperSidebar from './SuperSidebar';


const DEFAULT_TAB_TITLE = '(unnamed tab)';


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

  sidebarWidth?: number

  sidebarPosition?: WorkspaceProps['sidebarPosition']

  /** If not provided, sidebar cannot be resized. */
  onSidebarResize?: (newWidth: number) => void

  className?: string
}
const TabbedWorkspace: React.VoidFunctionComponent<TabbedWorkspaceProps<any>> =
function ({
  sidebarConfig,
  sidebarIDs,
  newTabPrompt,
  globalMode,
  statusBar,

  sidebarWidth,
  sidebarPosition,
  onSidebarResize,

  className,
}) {
  const { state, dispatch, protocolConfiguration, focusedTabURI } = useContext(TabbedWorkspaceContext);
  const focusedTabRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState<string>(DEFAULT_TAB_TITLE);

  useEffect(() => {
    let cancelled = false;
    if (!focusedTabURI) {
      setTitle(DEFAULT_TAB_TITLE);
      return;
    }
    (async () => {
      if (focusedTabURI) {
        const [proto, path] = focusedTabURI.split(':');
        const title = await protocolConfiguration[proto]?.plainTitle?.(path);

        if (cancelled) { return; }

        if (title) {
          setTitle(title);
        } else {
          setTitle(DEFAULT_TAB_TITLE);
        }
      }
    })();

    return function cleanUp() { cancelled = true; }
  }, [focusedTabURI]);

  useEffect(() => {
    if (state.focusedTabIdx >= 0) {
      focusedTabRef.current?.scrollIntoView();
    }
  }, [state.focusedTabIdx]);

  const sidebar = useMemo(() => {
    return <SuperSidebar
      config={sidebarConfig}
      sidebarIDs={sidebarIDs}
      width={sidebarWidth}
      onResize={onSidebarResize}
      resizeSensorPosition={
        //Resize sensor is on the side where main content is,
        //i.e. opposite of where sidebar is relative to main content.
        sidebarPosition === 'left' ? 'right' : 'left'}
      minWidth={250}
      maxWidth={600}
      selectedSidebarID={sidebarIDs.length > 1
        ? state.selectedSidebarID
        : sidebarIDs[0]}
      onSelectSidebar={sidebarIDs.length > 1
        ? id => dispatch({ type: 'focus-sidebar', payload: { id } })
        : undefined}
    />
  }, [
    dispatch,
    state.selectedSidebarID,
    sidebarIDs.toString(),
    sidebarWidth,
    onSidebarResize,
    JSON.stringify(normalizeObject(sidebarConfig)),
  ]);

  const tabPanes: Map<string, [JSX.Element, JSX.Element]> = useMemo(() => {
    return (state.detailTabURIs ?? []).
      map(uri => [
        uri,
        [<DetailTab uri={uri} />, <DetailTabTitle uri={uri} />],
      ] as [string, [JSX.Element, JSX.Element]]).
      reduce(
        ((prev, curr) => prev.set(curr[0], curr[1])),
        new Map() as Map<string, [JSX.Element, JSX.Element]>,
      );
  }, [(state.detailTabURIs ?? []).slice().sort().join('')]);

  const tabTitles: Map<string, JSX.Element> = useMemo(() => {
    return (state.detailTabURIs ?? []).
      map((uri, idx) => [
        uri,
        <div
            css={css`height: 24px;`}
            ref={idx === state.focusedTabIdx ? focusedTabRef : undefined}>
          <TabTitleButton
              interactive={idx !== state.focusedTabIdx}
              minimal={idx !== state.focusedTabIdx}
              onRemove={(evt: React.MouseEvent) => {
                dispatch({ type: 'close-tab', payload: { idx }});
                evt.stopPropagation();
              }}>
            {tabPanes.get(uri)?.[1] ?? DEFAULT_TAB_TITLE}
          </TabTitleButton>
        </div>,
      ] as [string, JSX.Element]).
      reduce(
        ((prev, curr) => prev.set(curr[0], curr[1])),
        new Map() as Map<string, JSX.Element>,
      );
  }, [dispatch, tabPanes, state.focusedTabIdx, focusedTabRef.current]);

  const homeTab = useMemo(() => (
    <Tab
      id={SPECIAL_TAB_IDX.new}
      title={
        <TabTitleButton
            minimal={state.focusedTabIdx !== SPECIAL_TAB_IDX.new}
            icon="home">
          Home
        </TabTitleButton>
      }
      panel={newTabPrompt}
    />
  ), [state.focusedTabIdx === SPECIAL_TAB_IDX.new]);

  const handleSelectedTabChange = useCallback((idx: number, oldIdx: number) => dispatch({
    type: 'focus-tab',
    payload: { idx },
  }), [dispatch]);

  return (
    <Workspace
        sidebar={sidebar}
        sidebarPosition={sidebarPosition}
        globalMode={globalMode}
        statusBar={statusBar}
        className={className}>
      <Tabs
          id="detailTabs"
          renderActiveTabPanelOnly
          selectedTabId={state.focusedTabIdx}
          onChange={handleSelectedTabChange}>

        {title
          ? <Helmet>
              <title>{title}</title>
            </Helmet>
          : null}

        {homeTab}

        {(state.detailTabURIs ?? []).map((uri, idx) =>
          <Tab
            id={idx}
            key={uri}
            panel={tabPanes.get(uri)?.[0]}
            title={tabTitles.get(uri)}
          />
        )}
      </Tabs>
    </Workspace>
  );
};


const Tabs = styled(BaseTabs)`
  background: ${Colors.LIGHT_GRAY2};
  .bp4-dark & { background: ${Colors.GRAY1}; }
  flex: 1;
  display: flex;
  flex-flow: column nowrap;

  position: relative;

  .bp4-tab-list {
    overflow-x: auto;
    height: 24px;
    position: relative;

    background: ${Colors.GRAY1};
    .bp4-dark & { background: ${Colors.DARK_GRAY3}; }

    /* Accommodate the new tab button, absolutely positioned */
    white-space: nowrap;

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
  .bp4-tab-indicator { display: none; }
  .bp4-tab {
    line-height: unset;
    position: unset;
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 400px;
  }
  .bp4-tab-panel {
    flex: 1;
    margin: 0;
    padding: 5px;
    position: relative;
    background: ${Colors.LIGHT_GRAY3};
    .bp4-dark & { background: ${Colors.DARK_GRAY3}; }
  }
`;


// NOTE: Minimal is set when it’s *not* selected
const TabTitleButton = styled(Tag)`
  border-radius: 0;
  height: 24px;
  padding: 0 8px;
  box-shadow: unset;

  color: ${({ minimal }) => minimal ? Colors.WHITE : Colors.BLACK} !important;
  ${({ minimal }) => minimal ? '' : `background: ${Colors.LIGHT_GRAY3}`} !important;
  /* NOTE: Selected item’s background must sync with tab-panel background. */

  .bp4-tag-remove {
    color: ${({ minimal }) => minimal ? Colors.WHITE : Colors.BLACK} !important;
    opacity: .5;
    &:hover {
      opacity: 1;
    }
  }

  .bp4-dark & {
    color: ${({ minimal }) => minimal ? Colors.LIGHT_GRAY2 : Colors.WHITE} !important;
    ${({ minimal }) => minimal ? '' : `background: ${Colors.DARK_GRAY3}`} !important;

    .bp4-tag-remove {
      color: ${({ minimal }) => minimal ? Colors.LIGHT_GRAY2 : Colors.WHITE} !important;
    }
  }
`;


export default TabbedWorkspace;
