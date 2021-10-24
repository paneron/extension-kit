import type React from 'react';
import { SidebarBlockConfig } from '../Sidebar/Block';


// Detail view protocols

export type URIDetailView = React.FC<{ uri: string }>;

export interface ProtocolConfig {
  main: URIDetailView
  title: URIDetailView
  plainTitle: (uri: string) => Promise<string>
}

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
  focusedTabURI?: string
  navigateFocusedTab?: (newURI: string) => void

  spawnTab: (uri: string) => void

  protocolConfiguration: ProtocolRegistry<Proto>,

  state: State<SidebarID>
  dispatch: React.Dispatch<Action<SidebarID>>
};


// Reducer-related types

export interface State<SidebarID extends string> {
  detailTabURIs: string[]
  focusedTabIdx: number
  selectedSidebarID: SidebarID
}

export type Action<SidebarID extends string> =
  | { type: 'spawn-tab'; payload: { uri: string } }
  | { type: 'focus-tab'; payload: { idx: number } }
  | { type: 'navigate-focused-tab'; payload: { uri: string } }
  | { type: 'move-tab'; payload: { sourceIdx: number, destinationIdx: number } }
  | { type: 'close-tab'; payload: { idx: number } }
  | { type: 'focus-sidebar'; payload: { id: SidebarID } }
