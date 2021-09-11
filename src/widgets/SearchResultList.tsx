/** @jsx jsx */
/** @jsxFrag React.Fragment */

import React, { useContext, useEffect, useState } from 'react';
import { jsx, css } from '@emotion/react';
import makeList, { ItemProps, LabelledListIcon, ListData } from './List';
import { DatasetContext } from '../context';
import { Classes, IconProps } from '@blueprintjs/core';


export interface SearchResultListData {
  indexID: string;
  selectedItemPath: string | null;
}

interface SearchResultListProps {
  queryExpression: string;
  selectedItemPath: string | null;
  onSelectItem: (itemPath: string | null) => void;
  onOpenItem: (itemPath: string) => void;
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

    const stringItemDescription = objPath ? `item at ${objPath}` : `item #${listItemRef}`;

    const objectDataResp = useObjectData({
      objectPaths: objPath ? [objPath] : [],
    });

    let isUpdating: boolean = filteredObjectResp.isUpdating;
    let itemView: JSX.Element;
    let fallbackView = <span css={css`opacity: .4`}>{stringItemDescription}</span>;

    if (objPath.trim() !== '') {
      try {
        const objData = objectDataResp.value.data[objPath] as ObjectData | null;
        isUpdating = isUpdating || objectDataResp.isUpdating;
        if (objData) {
          itemView = <InnerItemView objectData={objData} objectPath={objPath} />
        } else {
          itemView = fallbackView;
        }
      } catch (e) {
        itemView = fallbackView;
      }
    } else {
      itemView = fallbackView;
    }


    return (
      <LabelledListIcon
          isSelected={objPath !== '' && extraData.selectedItemPath === objPath}
          onSelect={onSelect}
          onOpen={onOpen}
          contentClassName={isUpdating ? Classes.SKELETON : undefined}
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
    //const indexProgress = indexDescReq.value.status.progress;
    useEffect(() => {
      if (selectedItemPath !== null && indexID !== '') {
        getFilteredIndexPosition({ indexID, objectPath: selectedItemPath }).
          then(({ position }) => {
            if (selectedIndexPos !== position && position !== null) {
              selectIndexPos(`${position}`);
            }
          });
      }
    }, [selectedItemPath, indexID]);

    function selectItemByPosition(pos: string) {
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
    }

    const extraData: SearchResultListData = {
      indexID,
      selectedItemPath,
    };

    function getListData(): ListData<SearchResultListData> | null {
      if (indexID) {
        const stubs: string[] = [...new Array(itemCount)].map((_, idx) => `${idx}`);
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
          openItem: async (pos) => {
            try {
              const position = parseInt(pos, 10);
              const itemPath = (await getObjectPathFromFilteredIndex({ indexID, position })).objectPath;
              if (itemPath) {
                onOpenItem(itemPath);
              }
            } catch (e) {
              console.error("Unable to open item");
            }
          },
          itemHeight: 24,
          padding: 0,
          extraData,
        };
      } else {
        return null;
      }
    }

    return <List
      className={className}
      getListData={getListData} />;
  };

  return SearchResultList;
}
