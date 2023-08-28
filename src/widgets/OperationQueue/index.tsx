/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx, css } from '@emotion/react';
import React, { useState } from 'react';
import {
  ProgressBar,
  type ToasterInstance,
} from '@blueprintjs/core';

import Context from './context';


const OperationQueueContextProvider: React.FC<{ toaster: ToasterInstance }> =
function ({ toaster, children }) {
  const [_operationKey, setOperationKey] = useState<string | undefined>(undefined);
  const [_opKeys, setOpKeys] = useState<Map<string, number>>(new Map());

  const [_lockingOperationKey, setLockingOperationKey] = useState<string | null>(null);

  const isBusy = _lockingOperationKey !== null && _lockingOperationKey !== undefined;

  return (
    <Context.Provider value={{
      isBusy,
      performOperation: function performOperation(gerund, func, opts) {
        const opKey = gerund;

        // We block by default for backwards compatibility.
        const isBlocking = opts?.blocking !== false;

        function unqueue() {
          setOperationKey(undefined);
          if (isBlocking) {
            setLockingOperationKey(null);
          }
          setOpKeys(map => map.set(opKey, (map.get(opKey) ?? 1) - 1));
        }

        return async (...args) => {
          if (!toaster) {
            throw new Error("Failed to perform operation: toaster not initialized");
          }
          if (_lockingOperationKey && isBlocking) {
            console.log("BLOCKED!", gerund, isBlocking, _lockingOperationKey);
            toaster.show({ message: `Can’t handle ${gerund}: already busy`, intent: 'warning' });
            throw new Error("Failed to queue operation: queue busy");
          }

          setOperationKey(opKey);
          setOpKeys(map => map.set(opKey, (map.get(opKey) ?? 0) + 1));

          if (isBlocking) {
            setLockingOperationKey(opKey);
          }

          const opCount = _opKeys.get(opKey) ?? 0;

          toaster.show({
            message: <div css={css`display: flex; flex-flow: row nowrap; white-space: nowrap; align-items: center;`}>
              <ProgressBar intent="primary" css={css`width: 50px;`} />
              &emsp;
              {gerund}{opCount > 1 ? <>&nbsp;({opCount})</> : null}…
            </div>,
            intent: 'primary',
            timeout: 0,
          }, gerund);

          try {
            const result = await func(...args);

            toaster.dismiss(opKey);

            unqueue();

            if (opCount < 1) {
              toaster.show({ message: `Done ${gerund}`, intent: 'success', icon: 'tick-circle' }, gerund);
            }

            return result;
          } catch (e) {
            let errMsg: string;
            const rawErrMsg = (e as any).toString?.();
            if (rawErrMsg.indexOf('Error:')) {
              const msgParts = rawErrMsg.split('Error:');
              errMsg = msgParts[msgParts.length - 1].trim();
            } else {
              errMsg = rawErrMsg;
            }

            toaster.dismiss(opKey);
            toaster.show({
              message: `Problem ${gerund}. The error said: “${errMsg}”`,
              intent: 'danger',
              icon: 'error',
              timeout: 0,
              onDismiss: () => {
                unqueue();
              },
            }, gerund);

            throw e;
          }
        }
      },
    }}>
      {children}
    </Context.Provider>
  );
}


export default OperationQueueContextProvider;
