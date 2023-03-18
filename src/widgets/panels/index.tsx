/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx, css } from '@emotion/react';
import React, { useState, useEffect, useRef } from 'react';
import { IconName } from '@blueprintjs/icons';
import { Classes, Colors, Icon } from '@blueprintjs/core';


export const PanelContext =
  React.createContext<{ state: any, setState: (opts: any) => void }>
  ({ state: {}, setState: () => {} });


export interface PanelProps {
  contentsRef?: (el: HTMLDivElement) => void,

  title?: string
  TitleComponent?: React.FC<{ isCollapsed?: boolean }>
  TitleComponentSecondary?: React.FC<{ isCollapsed?: boolean }>

  children: React.ReactNode

  isCollapsible?: true
  isCollapsedByDefault?: true

  className?: string
  collapsedClassName?: string
  titleBarClassName?: string
  contentsClassName?: string

  iconCollapsed?: IconName
  iconExpanded?: IconName
}
export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(function Panel({
    contentsRef,
    className, collapsedClassName,
    titleBarClassName,
    contentsClassName,

    title, TitleComponent, TitleComponentSecondary,
    iconCollapsed, iconExpanded,
    isCollapsible, isCollapsedByDefault,
    children }, wrapperRef) {

  const [isCollapsed, setCollapsedState] =
    useState<boolean>(isCollapsedByDefault || false);

  const [panelState, setPanelState] = useState<object>({});

  function onCollapse() {
    setCollapsedState(true);
  }
  function onExpand() {
    setCollapsedState(false);
  }

  const _contentsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (contentsRef && _contentsRef.current) {
      contentsRef(_contentsRef.current);
    }
  });

  const toggleIcon: IconName = isCollapsed
    ? (iconCollapsed || 'caret-right')
    : (iconExpanded || 'caret-down');

  return (
    <div
        ref={wrapperRef}
        css={css`
          display: flex;
          flex-flow: column nowrap;
          overflow: hidden;
          min-height: ${titleBarHeight};

          .bp4-form-group {
            padding: 0 .25rem;
            padding-bottom: .25rem;
            margin-bottom: 0;

            &:first-child {
              padding-top: .25rem;
            }

            .bp4-label {
              margin-bottom: 0;
            }

            &.bp4-inline {
              padding-right: .5rem;
            }
          }

          ${!isCollapsed
            ? css`
              min-height: $titleBarHeight * 2;
            `
            : ''}
        `}

        className={`
          ${Classes.ELEVATION_1}
          ${className || ''}
          ${isCollapsible && isCollapsed ? collapsedClassName : ''}
        `}>

      <PanelContext.Provider value={{
          state: panelState,
          setState: setPanelState,
        }}>

        {title || TitleComponent || isCollapsible
          ? <div
                css={css`
                  transition: background-color ${transition1};
                  background: ${Colors.LIGHT_GRAY3};
                  text-transform: uppercase;
                  font-size: 80%;
                  font-weight: bold;
                  letter-spacing: -.01em;
                  color: $pt-text-color-muted;

                  height: ${titleBarHeight};
                  flex-shrink: 0;

                  padding-left: ${gridSize / 2}px;
                  padding-right: ${gridSize / 2}px;

                  display: flex;
                  flex-flow: row nowrap;
                  align-items: center;

                  ${isCollapsible
                    ? css`
                        .trigger-icon {
                          transition: opacity $transition1;
                          opacity: .5;
                        }

                        &:hover {
                          background-color: ${Colors.LIGHT_GRAY2};
                          box-shadow: $pt-elevation-shadow-1;

                          .trigger-icon {
                            opacity: 1;
                          }
                        }
                        `
                    : ''}
                  }
                `}
                className={titleBarClassName}
                onClick={(isCollapsible === true && isCollapsed === false)
                  ? onCollapse
                  : onExpand}>

              {isCollapsible
                ? <Icon
                    className="trigger-icon"
                    icon={isCollapsible ? toggleIcon : 'blank'}
                  />
                : null}

              {title || TitleComponent
                ? <>
                    <span css={css`flex: 1; margin-left: ${gridSize / 2}px;`}>
                      {TitleComponent
                        ? <TitleComponent isCollapsed={isCollapsed} />
                        : title}
                    </span>
                    <span>
                      {TitleComponentSecondary
                        ? <TitleComponentSecondary isCollapsed={isCollapsed} />
                        : null}
                    </span>
                  </>
                : null}
            </div>
          : null}

        {isCollapsible && isCollapsed
          ? null
          : <div
                ref={_contentsRef}
                css={css`
                  overflow-y: auto;
                  overflow-x: hidden;
                  padding: .25rem;
                  background: ${Colors.LIGHT_GRAY3};

                  ${isCollapsible && isCollapsed
                    ? css`
                        display: none;
                      `
                    : ''}
                `}
                className={contentsClassName}>
              {children}
            </div>}

      </PanelContext.Provider>
    </div>
  );
});


const transition1 = `.2s linear`;
const titleBarHeight = `1.5rem`;
const gridSize = 20;
