/** @jsx jsx */
/** @jsxFrag React.Fragment */

import React from 'react';
import { jsx, css } from '@emotion/react';
import { ButtonGroup, ButtonGroupProps } from '@blueprintjs/core';


const BlockStateButtonGroup: React.FC<ButtonGroupProps> = function (props) {
  return <ButtonGroup
    css={css`opacity: 0.5; transform: scale(0.8) translateX(-2px); transform-origin: right;`}
    {...props}
  />;
};

export default BlockStateButtonGroup;
