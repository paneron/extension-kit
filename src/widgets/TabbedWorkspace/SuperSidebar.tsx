/** @jsx jsx */
/** @jsxFrag React.Fragment */

import React, { useContext, useMemo } from 'react';
import { jsx, css } from '@emotion/react';
import { Button, ButtonGroup, ButtonProps, Colors } from '@blueprintjs/core';
import styled from '@emotion/styled';

import { DatasetContext } from '../../context';
import makeSidebar from '../Sidebar';
import { SuperSidebarConfig } from './types';


interface SuperSidebarProps<SidebarID extends string> {
  config: SuperSidebarConfig<SidebarID>
  sidebarIDs: readonly SidebarID[]
  selectedSidebarID: SidebarID
  onSelectSidebar?: (id: SidebarID) => void 
  className?: string
}
const SuperSidebar: React.FC<SuperSidebarProps<any>> =
function ({ config, sidebarIDs, selectedSidebarID, onSelectSidebar, className }) {
  const { usePersistentDatasetStateReducer } = useContext(DatasetContext);

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
      <div css={css`
          width: 250px; position: relative;
          & > :first-child { position: absolute; inset: 0; }
          background: ${Colors.LIGHT_GRAY4};
        `}>
        {sidebarEls[selectedSidebarID]}
      </div>
      <ButtonGroup vertical className={className} css={css`background: ${Colors.LIGHT_GRAY2}`}>
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
    </>
  );
};

export default SuperSidebar;

const StyledSidebarButton = styled(Button)`
  border-radius: 0;
`;

const SidebarButton: React.FC<ButtonProps> = function (props) {
  return <StyledSidebarButton minimal large {...props} />;
};
