/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx, css } from '@emotion/react';
import React, { memo, useMemo, useCallback, useState } from 'react';
import { Toaster, Spinner, SpinnerSize, ProgressBar } from '@blueprintjs/core';

import Context, { type ContextSpec } from './context';


const toaster = Toaster.create({ position: 'bottom' });

const _opKeys: Map<string, number> = new Map();

function notify(opKey: string, blocking: boolean) {
  const opCount =  _opKeys.get(opKey) ?? 0;

  if (opCount < 1) {
    toaster.show({
      message: `Done ${opKey}`,
      intent: blocking ? 'success' : undefined,
      icon: 'tick-circle',
    }, opKey);
  } else {
    toaster.show({
      message:
        <div css={css`display: flex; flex-flow: row nowrap; white-space: nowrap; align-items: center;`}>
          {blocking
            ? <ProgressBar intent="primary" css={css`width: 50px;`} />
            : <Spinner size={SpinnerSize.SMALL} />}
          &emsp;
          {opKey}{opCount > 1 ? <>&nbsp;({opCount})</> : null}…
        </div>,
      intent: blocking ? 'primary' : undefined,
      timeout: 0,
    }, opKey);
  }
};


/**
 * Handles singleton, app-global operation queue context.
 */
const OperationQueueContextProvider: React.FC<Record<never, never>> =
memo(function ({ children }) {
  const [_lockingOperationKey, setLockingOperationKey] = useState<string | null>(null);

  const isBusy = _lockingOperationKey !== null && _lockingOperationKey !== undefined;

  const dequeue = useCallback(function _dequeue(opKey: string, isBlocking: boolean) {
    if (isBlocking) {
      setLockingOperationKey(null);
    }
    _opKeys.set(opKey, (_opKeys.get(opKey) ?? 1) - 1);
    notify(opKey, isBlocking);
  }, []);

  const queue = useCallback(function _queue(opKey: string, isBlocking: boolean) {
    if (isBlocking) {
      setLockingOperationKey(oldKey => {
        if (oldKey === null) {
          _opKeys.set(opKey, (_opKeys.get(opKey) ?? 0) + 1);
          notify(opKey, isBlocking);
          return opKey;
        } else {
          return oldKey;
        }
      });
    } else {
      _opKeys.set(opKey, (_opKeys.get(opKey) ?? 0) + 1);
      notify(opKey, isBlocking);
    }
  }, []);

  const performOperation: ContextSpec["performOperation"] =
  useCallback(function performOperation(gerund, func, opts) {
    const opKey = gerund;

    // We block by default for backwards compatibility.
    const isBlocking = opts?.blocking !== false;

    return async (...args) => {
      if (!toaster) {
        throw new Error("Failed to perform operation: toaster not initialized");
      }

      try {
        queue(opKey, isBlocking);
      } catch (e) {
        toaster.show({
          message: `Couldn’t queue ${opKey}`,
          intent: 'warning',
        });
        throw new Error(`Couldn’t queue ${opKey}`);
      }

      try {
        const result = await func(...args);

        dequeue(opKey, isBlocking);

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

        toaster.show({
          message: `Problem ${gerund}. The error said: “${errMsg}”`,
          intent: isBlocking ? 'danger' : 'warning',
          icon: 'error',
          timeout: 0,
          onDismiss: () => {
            dequeue(opKey, isBlocking);
          },
        }, opKey);

        throw e;
      }
    }
  }, [queue, dequeue]);

  const ctx = useMemo(
    (() => ({ isBusy, performOperation })),
    [performOperation, isBusy]);

  return (
    <Context.Provider value={ctx}>
      {children}
    </Context.Provider>
  );
});


export default OperationQueueContextProvider;
