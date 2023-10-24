import React from 'react';
import { Callout, NonIdealState } from '@blueprintjs/core';


// TODO: Give suggestions to resolve (move from dataset view)
export interface ErrorStateProps {
  inline?: boolean;
  technicalDetails?: string | JSX.Element;
  error?: string;
  viewName?: string;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = function ({
  inline,
  technicalDetails,
  error,
  viewName,
  className,
}) {
  if (inline) {
    return <span title={error} className={className}>
      [failed to render {viewName ?? 'view'}]
    </span>;
  } else {
    return (
      <NonIdealState
        icon="heart-broken"
        title="Ouch"
        className={className}
        description={<>
          <Callout style={{ textAlign: 'left' }} intent="primary">
            <p>
              We encountered an error in {viewName || 'a'} view.
              <br />
              In some cases reloading or reopening Paneron should address this,
              but please let us know if this repeats.
              <br />
              A likely cause is an engineering oversight
              where a component of an extension or Paneron host application
              could enter a state that was not accounted for.
            </p>
          </Callout>
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
  }
};

export default ErrorState;
