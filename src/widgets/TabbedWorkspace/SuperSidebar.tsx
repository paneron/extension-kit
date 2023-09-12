/** @jsx jsx */
/** @jsxFrag React.Fragment */

import React, { useState, useContext, useMemo, useEffect } from 'react';
import { jsx, css } from '@emotion/react';
import { Resizable } from 'react-resizable';
import { Button, ButtonGroup, ButtonProps } from '@blueprintjs/core';
import styled from '@emotion/styled';

import { DatasetContext } from '../../context';
import makeSidebar from '../Sidebar';
import ErrorBoundary from '../ErrorBoundary';
import type { SuperSidebarConfig } from './types';


const DEFAULT_MIN_WIDTH = 250;


interface SuperSidebarProps<SidebarID extends string> {
  config: SuperSidebarConfig<SidebarID>
  sidebarIDs: readonly SidebarID[]
  selectedSidebarID: SidebarID
  onSelectSidebar?: (id: SidebarID) => void 

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
const SuperSidebar: React.FC<SuperSidebarProps<any>> =
function ({
  config, resizeSensorPosition, sidebarIDs, selectedSidebarID,
  onSelectSidebar,
  width, maxWidth, minWidth, onResize,
  className,
}) {
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
    (() => Object.entries(config).
      map(([sid, sconf]) => {
        const Sidebar = makeSidebar(usePersistentDatasetStateReducer);
        return {
          [sid]:
            <ErrorBoundary viewName={`Sidebar ${sconf.title}`}>
              <Sidebar
                css={css`z-index: 5`}
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
      ? <ButtonGroup vertical className={className}>
          {sidebarIDs.map(sid => {
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
  ), [selectedSidebarID, sidebarIDs.join(','), className, onSelectSidebar]);


  const currentSidebar = useMemo(() => (
    <Resizable
        minConstraints={[minWidth ?? DEFAULT_MIN_WIDTH, Infinity]}
        maxConstraints={[maxWidth ?? 600, Infinity]}
        width={effectiveSidebarWidthPX}
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
              style={{ zIndex: 20 }}
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
  ]);

  return (
    <>
      {currentSidebar}
      {buttons}
    </>
  );
};

export default SuperSidebar;

const StyledSidebarButton = styled(Button)`
  border-radius: 0 !important;
`;

const SidebarButton: React.FC<ButtonProps> = function (props) {
  return <StyledSidebarButton minimal large {...props} />;
};
