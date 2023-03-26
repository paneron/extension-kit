/** @jsx jsx */
/** @jsxFrag React.Fragment */

import React, { useState, useContext, useMemo, useEffect } from 'react';
import { jsx, css } from '@emotion/react';
import { Resizable } from 'react-resizable';
import { Button, ButtonGroup, ButtonProps, Colors } from '@blueprintjs/core';
import styled from '@emotion/styled';

import { DatasetContext } from '../../context';
import makeSidebar from '../Sidebar';
import { SuperSidebarConfig } from './types';


const DEFAULT_MIN_WIDTH = 250;


interface SuperSidebarProps<SidebarID extends string> {
  config: SuperSidebarConfig<SidebarID>
  sidebarIDs: readonly SidebarID[]
  selectedSidebarID: SidebarID
  onSelectSidebar?: (id: SidebarID) => void 

  width?: number
  maxWidth?: number
  minWidth?: number
  onResize?: (width: number) => void

  className?: string
}
const SuperSidebar: React.FC<SuperSidebarProps<any>> =
function ({
  config, sidebarIDs, selectedSidebarID,
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
    if (onResize && resizedWidthPX) {
      onResize(resizedWidthPX);
    }
  }, [onResize, resizedWidthPX]);

  const sidebarEls = useMemo(
    (() => Object.entries(config).
      map(([sid, sconf]) => {
        const Sidebar = makeSidebar(usePersistentDatasetStateReducer);
        return {
          [sid]:
            <Sidebar
              css={css`z-index: 5`}
              title={sconf.title}
              stateKey={sid}
              blocks={sconf.blocks}
            />
        };
      }).
      reduce((prev, curr) => ({ ...prev, ...curr })) as Record<string, JSX.Element>),
    []);

  return (
    <>
      <Resizable
          minConstraints={[minWidth ?? DEFAULT_MIN_WIDTH, Infinity]}
          maxConstraints={[maxWidth ?? 600, Infinity]}
          width={effectiveSidebarWidthPX}
          axis='x'
          // Grid means we store nice round values and also debounce the event
          draggableOpts={{ grid: [50, 50] }}
          resizeHandles={onResize ? ['se'] : []}
          handle={onResize
            ? <div className="react-resizable-handle react-resizable-handle-se" style={{ zIndex: 20 }} />
            : undefined}
          onResize={onResize
            ? (_, { size }) => setResizedWidthPX(size.width)
            : undefined}>
        <div css={css`
            width: ${effectiveSidebarWidthPX}px; position: relative;
            & > :first-child { position: absolute; inset: 0; }
            background: ${Colors.LIGHT_GRAY4};
          `}>
          {sidebarEls[selectedSidebarID]}
        </div>
      </Resizable>
      {sidebarIDs.length > 1
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
        : null}
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
