/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { debounce } from 'throttle-debounce';
import { jsx, css } from '@emotion/react';
import React, { type ComponentType, memo, useEffect, useRef, useCallback, useMemo } from 'react';
import { FixedSizeList as List, type ListChildComponentProps, areEqual } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Colors, Icon, type IconProps } from '@blueprintjs/core';


const COMPACT = false;

export interface ListData<P extends Record<string, any> = Record<never, never>> {
  items: string[]
  selectedItem: string | null
  selectItem: (ref: string | null, extraData?: unknown) => void
  openItem?: (ref: string) => void
  itemHeight: number
  padding: number
  extraData: P
}

type ItemDataGetter<P extends Record<string, any> = Record<never, never>> = () => ListData<P> | null

export interface ItemProps<P extends Record<string, any> = Record<never, never>> {
  itemRef: string
  isSelected: boolean
  onSelect?: (extraData?: unknown) => void
  onOpen?: () => void
  padding: number 
  extraData: P
}

export interface ListProps<P extends Record<string, any> = Record<never, never>> {
  getListData: ItemDataGetter<P>
  className?: string
}

function makeList<P extends Record<string, any> = Record<never, never>>
(ItemContents: React.FC<ItemProps<P>>):
React.FC<ListProps<P>> {

  function getListIndex(items: string[], ref: string): { index: number } | null {
    const index = items.indexOf(ref);
    if (index >= 0) {
      return { index };
    }
    return null;
  }

  const Item: ComponentType<ListChildComponentProps> =
  memo(function ({ index, data, style }) {
    const _data: ListData<P> = data;
    const ref = _data?.items?.[index];
    if (ref) {
      const isSelected = _data.selectedItem === ref;
      return (
        <div
            css={css`
              position: relative;
              transition: box-shadow .25s linear;
              ${!COMPACT ? 'border: 1px solid transparent' : ''};
              ${isSelected
                ? COMPACT
                  ? 'box-shadow: 2px 2px 14px rgba(0, 0, 0, 0.4); z-index: 3;'
                  : 'border-color: silver; border-style: dotted;'
                : ''};
            `}
            style={style}>
          <ItemContents
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

  let listDataCache: ListData<P> | null = null;

  function maybeScrollToItem(listEl: List) {
    if (listDataCache !== null) {
      const { selectedItem, items } = listDataCache;
      if (selectedItem !== null) {
        const result = getListIndex(items, selectedItem);
        if (result?.index !== undefined) {
          listEl.scrollToItem(result.index, 'smart');
        } else {
          console.warn("List: couldn’t find row/column index of the selected item to jump to it", selectedItem);
        }
      }
    }
  }
  const maybeScrollToItemDebounced = debounce(100, maybeScrollToItem);

  return memo(function ItemList({ getListData, className }) {
    const ref = useRef<List>(null);

    const listData = useMemo(getListData, [getListData]);
    listDataCache = listData;

    useEffect(() => {
      const updateListHeight = () => ref.current
        ? maybeScrollToItemDebounced(ref.current)
        : void 0;
      window.addEventListener('resize', updateListHeight);
      updateListHeight();
      return function cleanup() {
        window.removeEventListener('resize', updateListHeight);
      }
    }, [listData?.items, listData?.selectedItem, ref.current]);

    return (
      <AutoSizer className={className}>
        {useCallback(({ width, height }) => {
          if (listData) {
            const itemCount = listData.items.length;
            return (
              <List
                  ref={ref}
                  width={width}
                  height={height}
                  itemCount={itemCount}
                  itemSize={listData?.itemHeight}
                  itemKey={(index) => {
                    const itemRef = listData?.items?.[index];
                    return itemRef ?? `${index}`;
                  }}
                  itemData={listData}>
                {Item}
              </List>
            );
          } else {
            return null;
          }
        }, [listData, ref.current])}
      </AutoSizer>
    );
  });
}


interface LabelledListIconProps {
  isSelected: boolean
  onSelect?: () => void
  onOpen?: () => void
  contentClassName?: string
  entityType?: {
    iconProps?: IconProps
    name: string
  }
  className?: string
}

export const LabelledListIcon: React.FC<LabelledListIconProps> =
memo(function ({ isSelected, onSelect, onOpen, contentClassName, entityType, className, children }) {
  return (
    <div
        onClick={onSelect}
        onDoubleClick={onOpen}
        className={className}
        css={css`
          position: absolute;
          inset: 0;
          overflow: hidden;
          cursor: default;
          z-index: ${isSelected ? 2 : 1};
          display: flex; flex-flow: row nowrap; align-items: center; align-content: center; justify-content: flex-start;
          background: ${isSelected ? `linear-gradient(345deg, ${Colors.LIGHT_GRAY3}, ${Colors.WHITE})` : Colors.LIGHT_GRAY5};
          ${!isSelected
            ? `box-shadow: 1px 1px 0 ${Colors.LIGHT_GRAY5} inset, -1px -1px 0 ${Colors.LIGHT_GRAY1} inset;`
            : ''}
          .bp4-dark & {
            background: ${isSelected ? `linear-gradient(345deg, ${Colors.DARK_GRAY4}, ${Colors.BLACK})` : Colors.DARK_GRAY5};
            ${!isSelected
              ? `box-shadow: 1px 1px 0 ${Colors.DARK_GRAY5} inset, -1px -1px 0 ${Colors.DARK_GRAY1} inset;`
              : ''}
          }
        `}>
      {entityType
        ? <div css={css`
              z-index: 3; font-size: 85%; line-height: 1.4;
              background: ${isSelected ? Colors.BLUE2 : Colors.LIGHT_GRAY3};
              .bp4-dark & {
                background: ${isSelected ? Colors.BLUE1 : Colors.DARK_GRAY4};
              }
              padding: 10px 5px;
              margin-right: 5px;
              letter-spacing: -0.03em;
              white-space: nowrap;
              ${isSelected ? 'font-variation-settings: \'GRAD\' 600;' : ''};
              color: ${isSelected ? Colors.LIGHT_GRAY4 : Colors.GRAY1};`}>
            {entityType.iconProps
              ? <Icon
                  iconSize={10}
                  css={css`position: relative; top: -2px; margin-right: 2.5px;`}
                  color={isSelected ? 'white' : Colors.GRAY2}
                  intent={isSelected ? 'primary' : undefined}
                  {...entityType.iconProps}
                />
              : null}
            {entityType.name}
          </div>
        : null}
      <div
          css={css`z-index: 2; flex: 1; font-size: 90%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`}
          className={contentClassName}>
        {children}
      </div>
    </div>
  );
});


export default makeList;
