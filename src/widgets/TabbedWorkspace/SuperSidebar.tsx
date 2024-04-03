/** @jsx jsx */
/** @jsxFrag React.Fragment */

import React, { memo, useState, useContext, useMemo, useEffect } from 'react';
import { jsx, css } from '@emotion/react';
import { Resizable } from 'react-resizable';
import { Button, ButtonGroup, ButtonProps } from '@blueprintjs/core';
import styled from '@emotion/styled';

import { DatasetContext } from '../../context';
import makeSidebar from '../Sidebar';
import ErrorBoundary from '../ErrorBoundary';
import type { SuperSidebarConfig } from './types';
import type { Entries } from '../../util';


const DEFAULT_MIN_WIDTH = 250;


interface SuperSidebarProps<SidebarIDs extends Readonly<string[]>> {
  config: SuperSidebarConfig<SidebarIDs>
  sidebarIDs: SidebarIDs
  selectedSidebarID: SidebarIDs[number]
  onSelectSidebar?: (id: SidebarIDs[number]) => void 

  width?: number
  maxWidth?: number
  minWidth?: number

  /**
   * Ran when sidebar is resized, debounced.
   * If not provided, resizing is not possible.
   */
  onResize?: (width: number) => void

  /**
   * Normally depends on where sidebar is positioned relative to main content.
   * Used for resize sensor icon.
   * If not provided, resizing is not possible.
   */
  resizeSensorPosition?: 'left' | 'right'

  className?: string
}
function SuperSidebar_<SidebarIDs extends Readonly<string[]>> ({
  config, resizeSensorPosition, sidebarIDs, selectedSidebarID,
  onSelectSidebar,
  width, maxWidth, minWidth, onResize,
  className,
}: SuperSidebarProps<SidebarIDs>) {
  const { usePersistentDatasetStateReducer } = useContext(DatasetContext);
  const [ resizedWidthPX, setResizedWidthPX ] = useState<number | undefined>(undefined);
  // While undefined, we fall back to sidebar width stored in settings or default value.

  const effectiveSidebarWidthPX = resizedWidthPX ?? width ?? minWidth ?? DEFAULT_MIN_WIDTH;

  // NOTE: Width changes must be debounced to avoid excess effect runs
  useEffect(() => {
    if (onResize && resizedWidthPX && resizeSensorPosition) {
      onResize(resizedWidthPX);
    }
  }, [onResize, resizedWidthPX, resizeSensorPosition]);

  const sidebarEls = useMemo(
    (() => (Object.entries(config) as Entries<typeof config>).
      map(([sid, sconf]) => {
        const Sidebar = makeSidebar(usePersistentDatasetStateReducer);
        return {
          [sid]:
            <ErrorBoundary viewName={`Sidebar ${sconf.title}`}>
              <Sidebar
                css={css`z-index: 19`}
                // NOTE: ^ z-index must be more than 20 if we want to contain Blueprint’s overlay within tab panel
                title={sconf.title}
                stateKey={sid}
                blocks={sconf.blocks}
              />
            </ErrorBoundary>
        };
      }).
      reduce((prev, curr) => ({ ...prev, ...curr }))),
    [config, usePersistentDatasetStateReducer]);

  const buttons: JSX.Element | null = useMemo(() => (
    sidebarIDs.length > 1
      ? <ButtonGroup vertical>
          {sidebarIDs.map((sid: SidebarIDs[number]) => {
            const Icon = config[sid].icon;
            return <SidebarButton
              key={sid}
              icon={<Icon />}
              active={selectedSidebarID === sid}
              onClick={onSelectSidebar ? () => onSelectSidebar(sid) : undefined}
              disabled={!onSelectSidebar}
            />
          })}
        </ButtonGroup>
      : null
  ), [selectedSidebarID, sidebarIDs.join(','), onSelectSidebar]);


  const currentSidebar = useMemo(() => (
    <Resizable
        minConstraints={[minWidth ?? DEFAULT_MIN_WIDTH, Infinity]}
        maxConstraints={[maxWidth ?? 600, Infinity]}
        width={effectiveSidebarWidthPX}
        className={className}
        axis='x'
        // Grid means we store nice round values and also debounce the event
        draggableOpts={{ grid: [50, 50] }}
        resizeHandles={onResize
          ? resizeSensorPosition === 'right'
            ? ['se']
            : ['sw']
          : []}
        handle={onResize && resizeSensorPosition
          ? <div
              className={`
                react-resizable-handle
                react-resizable-handle-${resizeSensorPosition === 'right' ? 'se' : 'sw'}
              `}
              style={{ zIndex: 21 }}
            />
          : undefined}
        onResize={onResize && resizeSensorPosition
          ? (_, { size }) => setResizedWidthPX(size.width)
          : undefined}>
      <div css={css`
          width: ${effectiveSidebarWidthPX}px; position: relative;
          & > :first-child { position: absolute; inset: 0; }
        `}>
        {sidebarEls[selectedSidebarID]}
      </div>
    </Resizable>
  ), [
    selectedSidebarID,
    effectiveSidebarWidthPX,
    sidebarEls,
    onResize,
    resizeSensorPosition,
    setResizedWidthPX,
    minWidth,
    maxWidth,
    DEFAULT_MIN_WIDTH,
    className,
  ]);

  return (
    <>
      {currentSidebar}
      {buttons}
    </>
  );
};

const SuperSidebar = memo(SuperSidebar_);

export default SuperSidebar;

const StyledSidebarButton = styled(Button)`
  border-radius: 0 !important;
`;

const SidebarButton: React.FC<ButtonProps> = memo(function (props) {
  return <StyledSidebarButton minimal large {...props} />;
});
