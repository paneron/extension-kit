import React from 'react';
import { Callout, NonIdealState } from '@blueprintjs/core';


// TODO: Give suggestions to resolve (move from dataset view)
export interface ErrorStateProps {
  technicalDetails?: string | JSX.Element;
  error?: string;
  viewName?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = function ({ technicalDetails, error, viewName }) {
  return (
    <NonIdealState
      icon="heart-broken"
      title="Ouch"
      description={<>
        <p>
          Unable to display {viewName || 'view'}.
          </p>
        {technicalDetails || error
          ? <Callout style={{ textAlign: 'left', transform: 'scale(0.9)' }} title="Technical details">
            {technicalDetails}
            {error
              ? <pre style={{ overflow: 'auto', paddingBottom: '1em' }}>
                {error || 'error information is unavailable'}
              </pre>
              : null}
          </Callout>
          : null}
      </>} />
  );
};

export default ErrorState;
