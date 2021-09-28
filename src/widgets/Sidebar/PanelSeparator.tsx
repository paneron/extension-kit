/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import React from 'react';
import { Colors } from '@blueprintjs/core';


export const PanelSeparator: React.FC<{ className?: string }> = function ({ className }) {
  return <hr
    css={css`border-color: ${Colors.LIGHT_GRAY4}; border-style: solid; width: 100%;`}
    className={className}
  />;
};


export default PanelSeparator;
