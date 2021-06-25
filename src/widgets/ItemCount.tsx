/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { Icon, Spinner } from '@blueprintjs/core';
import { jsx, css } from '@emotion/react';
import React from 'react';


const ICON_PROPS = {
  iconSize: 10,
};

const SPINNER_PROPS = {
  size: 10,
};


export interface ItemCountProps {
  totalCount: number
  descriptiveName?: { singular: string, plural: string }
  progress?: { phase: string, loaded?: number, total?: number } 
  onRefresh?: () => void
  className?: string
}
export const ItemCount: React.FC<ItemCountProps> =
function ({ progress, onRefresh, descriptiveName, totalCount, className }) {

  let statusIcon: JSX.Element;
  if (progress) {
    if (progress.loaded || progress.total) {
      const progressValue = Math.floor(100 / (progress.total || 100) * (progress.loaded || 0.5)) / 100;
      statusIcon = <Spinner {...SPINNER_PROPS} value={progressValue} />;
    } else {
      statusIcon = <Spinner {...SPINNER_PROPS} />;
    }
  } else if (onRefresh) {
    statusIcon = <Icon {...ICON_PROPS} icon="refresh" onClick={onRefresh} title="Click to refresh" />;
  } else {
    statusIcon = <Icon {...ICON_PROPS} icon="symbol-circle" />;
  }

  let progressDescription: JSX.Element | null;
  if (progress) {
    progressDescription = <>
      {progress.phase}
      {progress.loaded || progress.total
        ? <span>: <code>{progress.loaded ?? '?'}</code> of <code>{progress.total ?? '?'}</code>…</span>
        : <>…</>}
    </>;
  } else {
    progressDescription = null;
  }

  return (
    <div css={css`display: flex; flex-flow: row nowrap; align-items: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`} className={className}>
      <div css={css`margin-right: .5rem;`}>
        {statusIcon}
      </div>

      <div>
        Showing {totalCount} {descriptiveName ? descriptiveName.plural : 'items'}
      </div>

      {progressDescription ? <div css={css`text-transform: capitalize`}>. {progressDescription}</div> : null}
    </div>
  );

}

export default ItemCount;
