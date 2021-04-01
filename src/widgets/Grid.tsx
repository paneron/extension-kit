/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { debounce } from 'throttle-debounce';
import { jsx, css } from '@emotion/core';
import React, { ComponentType, useEffect, useRef } from 'react';
import { FixedSizeGrid as Grid, GridChildComponentProps, areEqual } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Colors, Icon, IIconProps, ITagProps, NonIdealState, Spinner, Tag } from '@blueprintjs/core';


export interface GridData<P extends Record<string, any> = Record<never, never>> {
  items: string[][] // items chunked into rows
  selectedItem: string | null
  selectItem: (ref: string | null) => void
  openItem?: (ref: string) => void
  cellWidth: number
  cellHeight: number
  padding: number
  extraData: P
  status?: {
    progress?: { phase: string, total?: number, loaded?: number }
    descriptiveName?: { singular: string, plural: string }
    totalCount: number
  }
}

type ItemDataGetter<P extends Record<string, any> = Record<never, never>> = (width: number) => GridData<P> | null

export interface CellProps<P extends Record<string, any> = Record<never, never>> {
  itemRef: string
  isSelected: boolean
  onSelect?: () => void
  onOpen?: () => void
  height: number
  width: number
  padding: number 
  extraData: P
}

function makeGrid<P extends Record<string, any> = Record<never, never>>
(CellContents: React.FC<CellProps<P>>):
React.FC<{ getGridData: ItemDataGetter<P>, className?: string }> {

  function getGridIndex(items: string[][], ref: string): { columnIndex: number, rowIndex: number } | null {
    const rowIndex = items.findIndex(row => row.indexOf(ref) >= 0);
    if (rowIndex >= 0) {
      const row = items[rowIndex];
      const columnIndex = row.indexOf(ref);
      if (columnIndex >= 0) {
        return { rowIndex, columnIndex };
      }
    }
    return null;
  }

  const Cell: ComponentType<GridChildComponentProps> =
  React.memo(function ({ columnIndex, rowIndex, data, style }) {
    const _data: GridData = data;
    const ref = _data.items[rowIndex]?.[columnIndex];
    if (ref) {
      return (
        <div style={style}>
          <CellContents
            isSelected={_data.selectedItem === ref}
            onSelect={() => _data.selectItem(ref)}
            onOpen={_data.openItem ? () => _data.openItem!(ref) : undefined}
            height={_data.cellHeight}
            width={_data.cellWidth}
            padding={_data.padding}
            extraData={_data.extraData as P}
            itemRef={ref} />
        </div>
      );
    } else {
      return null;
    }
  }, areEqual);

  return ({ getGridData, className }) => {
    const gridRef = useRef<Grid>(null);

    useEffect(() => {
      const updateListHeight = debounce(100, () => {
        setImmediate(() => {
          const { selectedItem, items } = getGridData(1000) ?? { selectedItem: null, items: [] };
          if (items && selectedItem !== null && gridRef?.current) {
            const idx = getGridIndex(items, selectedItem);
            if (idx) {
              gridRef.current.scrollToItem({ align: 'smart', ...idx })
            }
          }
        });
      });

      window.addEventListener('resize', updateListHeight);
      updateListHeight();

      return function cleanup() {
        window.removeEventListener('resize', updateListHeight);
      }
    }, [gridRef.current]);

    return (
      <AutoSizer className={className}>
        {({ width, height }) => {
          const gridData = getGridData(width);
          if (gridData) {
            const columnCount = (gridData.items[0] ?? []).length;
            const rowCount = gridData.items.length;
            return (
              <>
                <Grid
                    width={width}
                    css={css`padding-bottom: ${gridData.cellHeight}px`}
                    height={height}
                    columnCount={columnCount}
                    columnWidth={gridData.cellWidth}
                    rowCount={rowCount}
                    rowHeight={gridData.cellHeight}
                    itemKey={({ columnIndex, rowIndex }) => {
                      const itemRef = gridData.items[rowIndex]?.[columnIndex];
                      if (!itemRef) {
                        return columnIndex * rowIndex;
                      }
                      return itemRef;
                    }}
                    itemData={gridData}>
                  {Cell}
                </Grid>
                {gridData.status
                  ? <div css={css`
                        position: absolute; bottom: 0; left: 0; right: 0;
                        background: rgba(255, 255, 255, 0.85); color: ${Colors.GRAY3};
                        display: flex;
                        flex-flow: row nowrap;
                        align-items: center;
                        padding: 5px ${gridData.padding}px; font-size: 80%;`}>
                      Showing {gridData.status.totalCount} {gridData.status.descriptiveName ? gridData.status.descriptiveName.plural : 'items'}
                      &emsp;
                      {gridData.status.progress
                        ? <Spinner
                            size={10}
                            value={gridData.status.progress.loaded && gridData.status.progress.total
                              ? gridData.status.progress.loaded / gridData.status.progress.total
                              : undefined}
                          />
                        : null}
                    </div>
                  : null}
              </>
            );
          } else {
            return <NonIdealState title="Nothing to show" icon="heart-broken" />;
          }
        }}
      </AutoSizer>
    );
  };
}


interface LabelledGridIconProps {
  isSelected: boolean
  onSelect?: () => void
  onOpen?: () => void
  iconProps?: IIconProps
  tagProps?: ITagProps
  height: number
  width: number
  padding: number 
}

export const LabelledGridIcon: React.FC<LabelledGridIconProps> =
function ({ isSelected, onSelect, onOpen, height, padding, tagProps, iconProps, children }) {
  return (
    <div
        css={css`text-align: center; height: ${height - padding}px; padding: ${padding}px; display: flex; flex-flow: column nowrap; align-items: center; justify-content: space-around;`}>
      <Icon
          iconSize={Icon.SIZE_LARGE}
          icon="blank"
          intent={isSelected ? 'primary' : undefined}
          onDoubleClick={onOpen}
          onClick={onSelect}
          {...iconProps} />
      <Tag
          css={css`cursor: default;`}
          minimal fill
          intent={isSelected ? 'primary' : undefined}
          onDoubleClick={onOpen}
          onClick={onSelect}
          {...tagProps}>
        {children}
      </Tag>
    </div>
  );
};


export default makeGrid;
