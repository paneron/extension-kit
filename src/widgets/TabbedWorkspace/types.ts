import type React from 'react';
import type { SidebarBlockConfig } from '../Sidebar/Block';


// Detail view protocols

export type URIDetailView = React.VoidFunctionComponent<{ uri: string }>;

export interface ProtocolConfig {
  main: URIDetailView
  title: URIDetailView

  /**
   * Provides plain-text title.
   *
   * @deprecated do not use.
   * For window titles, put <Helmet> within relevant tab component.
   */
  plainTitle?: (uri: string) => Promise<string>
}

/** Defines which React components should be used for which protocol among tabs. */
export type ProtocolRegistry<Protocol extends string> = Record<Protocol, ProtocolConfig>;


// Sidebars

interface SidebarConfig {
  icon: React.FC<Record<never, never>>
  title: JSX.Element | string
  blocks: SidebarBlockConfig[]
  description?: string
}

export type SuperSidebarConfig<SidebarID extends string> = Record<SidebarID, SidebarConfig>;


// Workspace

export type TabbedWorkspaceContext<Proto extends string, SidebarID extends string> = {
  /** The URI of currently focused tab. */
  focusedTabURI?: string

  /** Navigates currently focused tab to a new URI. */
  navigateFocusedTab?: (newURI: string) => void

  /** Open a new tab with specified URI next to the focused one. */
  spawnTab: (uri: string) => void

  /** Despawns tab with given URI. */
  closeTabWithURI: (uri: string) => void

  protocolConfiguration: ProtocolRegistry<Proto>,

  state: State<SidebarID>
  dispatch: React.Dispatch<Action<SidebarID>>
};


// Reducer-related types

/** Current state of tabs and sidebars in the workspace. */
export interface State<SidebarID extends string> {
  /**
   * Tabs, according to the order
   * (would be left-to-right in LTR, currently the only direction supported).
   */
  detailTabURIs: Readonly<string[]>

  /** Selected tab index in `detailTabURIs`. */
  focusedTabIdx: number

  /**
   * Selected sidebar ID
   * (see `TabbedWorkspaceProps['sidebarConfig']`, sidebar configuration
   * is not part of state (though maybe it should be?)).
   */
  selectedSidebarID: SidebarID
}

export type Action<SidebarID extends string> =
  | { type: 'spawn-tab'; payload: { uri: string } }
  | { type: 'focus-tab'; payload: { idx: number } }
  | { type: 'navigate-focused-tab'; payload: { uri: string } }
  | { type: 'move-tab'; payload: { sourceIdx: number, destinationIdx: number } }
  | { type: 'close-tab'; payload: { idx: number } }
  | { type: 'focus-sidebar'; payload: { id: SidebarID } }
