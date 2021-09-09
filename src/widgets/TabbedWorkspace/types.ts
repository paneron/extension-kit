type URIDetailView = React.FC<{ uri: string }>;

export type ProtocolRegistry<Protocol extends string> = Record<
  Protocol, {
    main: URIDetailView
    title: URIDetailView
    plainTitle: (uri: string) => Promise<string>
  }
>;

export type TabbedWorkspaceContext<Proto extends string, SidebarID extends string> = {
  focusedTabURI?: string
  spawnTab: (uri: string) => void

  protocolConfiguration: ProtocolRegistry<Proto>,

  state: State<SidebarID>
  dispatch: React.Dispatch<Action<SidebarID>>
};

export interface State<SidebarID extends string> {
  detailTabURIs: string[]
  focusedTabIdx: number
  selectedSidebarID: SidebarID
}

export type Action<SidebarID extends string> =
  | { type: 'spawn-tab'; payload: { uri: string } }
  | { type: 'focus-tab'; payload: { idx: number } }
  | { type: 'move-tab'; payload: { sourceIdx: number, destinationIdx: number } }
  | { type: 'close-tab'; payload: { idx: number } }
  | { type: 'focus-sidebar'; payload: { id: SidebarID } }
