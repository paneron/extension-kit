/** @jsx jsx */
import { jsx } from '@emotion/core';

import 'electron';
import log from 'electron-log';
import { ExtensionContext, Plugin } from './types';
import { ExtensionViewContext } from './context';


export interface ExtensionMakerProps {
  name: string
  repoView: () => Promise<{ default: React.FC<Record<never, never>> }> 
}

type ExtensionMaker = (options: ExtensionMakerProps) => Promise<Plugin>;

/* The default export of Paneron extension’s extension.ts entry file
   should be the result of calling this function. */
export const makeExtension: ExtensionMaker = async (options) => {
  let plugin: Plugin;

  if (process.type === 'browser') {
    plugin = {};

  } else if (process.type === 'renderer') {

    try {
      plugin = new Promise((resolve, reject) => {
        try {
          options.repoView().
          then((importResult) => {
            resolve({
              repositoryView: withExtensionContext(importResult.default),
            });
          }).
          catch((e) => {
            log.error("Paneron extension: Failed to resolve repository view", options.name, JSON.stringify(e));
            reject(e);
          });
        } catch (e) {
          log.error("Paneron extension: Failed to call repository view resolver", options.name, JSON.stringify(e));
          resolve({});
        }
      });
    } catch (e) {
      log.error("Paneron extension: Failed to instantiate the promise", options.name, e);
      plugin = new Promise((resolve) => { resolve({}) });
    }

  } else {
    log.error("Paneron extension: Unsupported process type", options.name);
    throw new Error("Unsupported process type");

  }

  return plugin;

}
