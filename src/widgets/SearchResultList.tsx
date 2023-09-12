/** @jsx jsx */
/** @jsxFrag React.Fragment */

import React, { useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { jsx, css } from '@emotion/react';
import { Classes, IconProps } from '@blueprintjs/core';

import makeList, { ItemProps, LabelledListIcon, ListData } from './List';
import { DatasetContext } from '../context';


export interface SearchResultListData {
  indexID: string;
  selectedItemPath: string | null;
}

interface SearchResultListProps {
  queryExpression: string;
  selectedItemPath: string | null;
  onSelectItem: (itemPath: string | null) => void;
  onOpenItem?: (itemPath: string) => void;
  keyExpression?: string;
  className?: string;
}


export default function makeSearchResultList
<ObjectData extends Record<string, any>>(
  InnerItemView: React.FC<{ objectData: ObjectData, objectPath: string }>,
  getEntityInfoForObjectPath: (objPath: string) => { name: string, iconProps: IconProps },
):
React.FC<SearchResultListProps> {

  const IndexedListItem: React.FC<ItemProps<SearchResultListData>> =
  function ({ onSelect, onOpen, extraData, itemRef: listItemRef }) {
    const { useObjectPathFromFilteredIndex, useObjectData } = useContext(DatasetContext);

    let position: number;
    try {
      position = parseInt(listItemRef, 10);
    } catch (e) {
      position = 0;
    }
    const filteredObjectResp = useObjectPathFromFilteredIndex({
      indexID: extraData.indexID,
      position,
    });

    const objPath = filteredObjectResp.value.objectPath;

    const fallbackView = useMemo(() => {
      const stringItemDescription = objPath ? `item at ${objPath}` : `item #${listItemRef}`;
      return <span css={css`opacity: .4`}>{stringItemDescription}</span>;
    }, [objPath, listItemRef]);

    const objectDataResp = useObjectData({
      objectPaths: objPath ? [objPath] : [],
    });

    const isUpdating = (objPath ? objectDataResp.isUpdating : false) || filteredObjectResp.isUpdating;
    const objData = (objPath ? objectDataResp.value.data[objPath] : null) as ObjectData | null;

    let itemView: JSX.Element = useMemo(() => {
      if (objData) {
        return <InnerItemView objectData={objData} objectPath={objPath} />;
      } else {
        return fallbackView;
      }
    }, [objPath, objData, fallbackView]);

    return (
      <LabelledListIcon
          isSelected={objPath !== '' && extraData.selectedItemPath === objPath}
          onSelect={onSelect}
          onOpen={onOpen}
          contentClassName={(isUpdating && !objData) ? Classes.SKELETON : undefined}
          entityType={getEntityInfoForObjectPath(objPath)}>
        {itemView}
      </LabelledListIcon>
    );
  };

  const List = makeList<SearchResultListData>(IndexedListItem);

  const SearchResultList: React.FC<SearchResultListProps> =
  function ({ queryExpression, selectedItemPath, onSelectItem, onOpenItem, keyExpression, className }) {
    const {
      useFilteredIndex, useIndexDescription, getFilteredIndexPosition, getObjectPathFromFilteredIndex,
    } = useContext(DatasetContext);

    const [selectedIndexPos, selectIndexPos] = useState<string | null>(null);

    const indexReq = useFilteredIndex({
      queryExpression,
      keyExpression: keyExpression
        ? `return ${keyExpression}`
        : undefined,
    });
    const indexID: string = indexReq.value.indexID ?? '';

    const indexDescReq = useIndexDescription({ indexID });
    const itemCount = indexDescReq.value.status.objectCount;

    const stubs: string[] = useMemo(
      () => [...new Array(itemCount)].map((_, idx) => `${idx}`),
      [itemCount]);

    //const indexProgress = indexDescReq.value.status.progress;
    useEffect(() => {
      let cancelled = false;
      if (selectedItemPath !== null && indexID !== '') {
        getFilteredIndexPosition({ indexID, objectPath: selectedItemPath }).
          then(({ position }) => {
            if (!cancelled && selectedIndexPos !== position && position !== null) {
              selectIndexPos(`${position}`);
            }
          });
      }
      return function cleanUp() { cancelled = true; };
    }, [selectedItemPath, selectedIndexPos, indexID]);

    const selectItemByPosition = useCallback(function _selectItemByPosition(pos: string) {
      try {
        const position = parseInt(pos, 10);
        getObjectPathFromFilteredIndex({ indexID, position }).then(({ objectPath }) => {
          if (objectPath !== selectedItemPath) {
            onSelectItem(objectPath);
          }
        });
      } catch (e) {
        console.error("Unable to select item by position");
      }
    }, [selectedItemPath, indexID, onSelectItem]);

    const extraData: SearchResultListData = useMemo((() => ({
      indexID,
      selectedItemPath,
    })), [indexID, selectedItemPath]);

    const getListData = useCallback(function _getListData(): ListData<SearchResultListData> | null {
      if (indexID) {
        return {
          items: stubs,
          selectedItem: selectedIndexPos,
          selectItem: (pos) => {
            selectIndexPos(pos);
            if (pos) {
              selectItemByPosition(pos);
            } else {
              onSelectItem(null);
            }
          },
          openItem: onOpenItem
            ? async (pos) => {
                try {
                  const position = parseInt(pos, 10);
                  const itemPath = (await getObjectPathFromFilteredIndex({ indexID, position })).objectPath;
                  if (itemPath) {
                    onOpenItem(itemPath);
                  }
                } catch (e) {
                  console.error("Unable to open item");
                }
              }
            : undefined,
          itemHeight: 24,
          padding: 0,
          extraData,
        };
      } else {
        return null;
      }
    }, [selectedIndexPos, selectItemByPosition, indexID, stubs, extraData, onOpenItem, onSelectItem]);

    return <List
      className={className}
      getListData={getListData}
    />;
  };

  return SearchResultList;
}
