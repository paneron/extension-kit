/** @jsx jsx */
/** @jsxFrag React.Fragment */

import React, { useContext } from 'react';
import { jsx } from '@emotion/react';
import { NonIdealState } from '@blueprintjs/core';
import { TabbedWorkspaceContext } from './context';


export const DetailTab: React.FC<{ uri: string }> = function ({ uri }) {
  const { protocolConfiguration } = useContext(TabbedWorkspaceContext);
  const [proto, _path] = uri.split(':');
  const protoConf = protocolConfiguration[proto];
  if (protoConf) {
    const View = protoConf.main;
    return <View uri={_path} />;
  } else {
    return <NonIdealState icon="heart-broken" description={`Unknown protocol ${proto}`} />;
  }
};


export const DetailTabTitle: React.FC<{ uri: string }> = function ({ uri }) {
  const { protocolConfiguration } = useContext(TabbedWorkspaceContext);
  const [proto, _path] = uri.split(':');
  const protoConf = protocolConfiguration[proto];
  if (protoConf) {
    const View = protoConf.title;
    return <View uri={_path} />;
  } else {
    return <>{uri}</>;
  }
};

