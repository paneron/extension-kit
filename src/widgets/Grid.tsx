/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { debounce } from 'throttle-debounce';
import { jsx, css } from '@emotion/core';
import React, { ComponentType, useEffect, useRef } from 'react';
import { FixedSizeGrid as Grid, GridChildComponentProps, areEqual } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Colors, Icon, IconProps } from '@blueprintjs/core';


export interface GridData<P extends Record<string, any> = Record<never, never>> {
  items: string[][] // items chunked into rows
  selectedItem: string | null
  selectItem: (ref: string | null, extraData?: unknown) => void
  openItem?: (ref: string) => void
  cellWidth: number
  cellHeight: number
  padding: number
  extraData: P
}

type ItemDataGetter<P extends Record<string, any> = Record<never, never>> = (width: number) => GridData<P> | null

export interface CellProps<P extends Record<string, any> = Record<never, never>> {
  itemRef: string
  isSelected: boolean
  onSelect?: (extraData?: unknown) => void
  onOpen?: () => void
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
    const _data: GridData<P> = data;
    const ref = _data.items[rowIndex]?.[columnIndex];
    const isSelected = _data.selectedItem === ref;
    if (ref) {
      return (
        <div
            css={css`
              position: relative;
              transition: box-shadow .25s linear;
              ${isSelected
                ? 'box-shadow: 2px 2px 14px rgba(0, 0, 0, 0.4); z-index: 3;'
                : ''}
            `}
            style={style}>
          <CellContents
            isSelected={isSelected}
            onSelect={(extraData) => _data.selectItem(ref, extraData)}
            onOpen={_data.openItem ? () => _data.openItem!(ref) : undefined}
            padding={_data.padding}
            extraData={_data.extraData as P}
            itemRef={ref} />
        </div>
      );
    } else {
      return null;
    }
  }, areEqual);

  let gridDataCache: GridData<P> | null = null;

  function maybeScrollToItem(gridEl: Grid) {
    if (gridDataCache !== null) {
      const { selectedItem, items } = gridDataCache;
      if (selectedItem !== null) {
        const idx = getGridIndex(items, selectedItem);
        if (idx) {
          gridEl.scrollToItem({ align: 'smart', ...idx });
        }
      }
    }
  }
  const maybeScrollToItemDebounced = debounce(100, maybeScrollToItem);

  return ({ getGridData, className }) => {
    const gridRef = useRef<Grid>(null);

    useEffect(() => {
      const updateListHeight = () => gridRef.current ? maybeScrollToItemDebounced(gridRef.current) : void 0;
      window.addEventListener('resize', updateListHeight);
      updateListHeight();
      return function cleanup() {
        window.removeEventListener('resize', updateListHeight);
      }
    }, [getGridData, gridRef.current]);

    return (
      <AutoSizer className={className}>
        {({ width, height }) => {
          const gridData = getGridData(width);
          gridDataCache = gridData;
          if (gridData) {
            const columnCount = (gridData.items[0] ?? []).length;
            const rowCount = gridData.items.length;
            return (
              <Grid
                  ref={gridRef}
                  width={width}
                  height={height}
                  columnCount={columnCount}
                  columnWidth={gridData.cellWidth}
                  rowCount={rowCount}
                  rowHeight={gridData.cellHeight}
                  itemKey={({ columnIndex, rowIndex }) => {
                    const itemRef = gridData.items[rowIndex]?.[columnIndex];
                    return itemRef ?? columnIndex * rowIndex;
                  }}
                  itemData={gridData}>
                {Cell}
              </Grid>
            );
          } else {
            return null;
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
  contentClassName?: string
  entityType?: {
    iconProps?: IconProps
    name: string
  }
  padding: number 
  className?: string
}

export const LabelledGridIcon: React.FC<LabelledGridIconProps> =
function ({ isSelected, onSelect, onOpen, padding, contentClassName, entityType, className, children }) {
  const hPad = Math.floor(padding / 2);
  const qPad = Math.floor(padding / 4);
  return (
    <div
        onClick={onSelect}
        onDoubleClick={onOpen}
        className={className}
        css={css`
          position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          box-shadow: 1px 1px 0 ${Colors.LIGHT_GRAY5} inset, -1px -1px 0 ${Colors.LIGHT_GRAY1} inset;
          overflow: hidden;
          cursor: default;
          z-index: ${isSelected ? 2 : 1};
          display: flex; flex-flow: column nowrap; align-items: stretch; justify-content: flex-start;
          background: ${isSelected ? `linear-gradient(345deg, ${Colors.LIGHT_GRAY3}, white)` : Colors.LIGHT_GRAY5};`}>
      {entityType
        ? <div css={css`
              z-index: 3; font-size: 85%; line-height: 1.4; margin: 1px 1px 0 1px;
              padding: ${qPad - 1}px ${padding}px ${qPad}px ${padding}px;
              background: ${isSelected ? Colors.BLUE2 : Colors.LIGHT_GRAY3};
              letter-spacing: -0.03em;
              white-space: nowrap;
              ${isSelected ? 'font-variation-settings: \'GRAD\' 600;' : ''};
              color: ${isSelected ? Colors.LIGHT_GRAY4 : Colors.GRAY1};`}>
            {entityType.iconProps
              ? <Icon
                  iconSize={10}
                  icon="blank"
                  css={css`margin-right: ${hPad}px; position: relative; top: -2px;`}
                  color={isSelected ? 'white' : Colors.GRAY2}
                  intent={isSelected ? 'primary' : undefined}
                  {...entityType.iconProps}
                />
              : null}
            {entityType.name}
          </div>
        : null}
      <div
          css={css`z-index: 2; flex: 1; font-size: 90%; padding: ${hPad}px ${padding}px;`}
          className={contentClassName}>
        {children}
      </div>
    </div>
  );
};


export default makeGrid;
