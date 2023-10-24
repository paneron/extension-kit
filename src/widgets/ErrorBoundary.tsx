/** @jsx jsx */
/** @jsxFrag React.Fragment */

import React from 'react';
import { jsx } from '@emotion/react';
import ErrorState from './ErrorState';


class ErrorBoundary extends React.Component<{ viewName?: string; inline?: boolean; }, { error?: string; }> {
  constructor(props: { viewName?: string; inline?: boolean }) {
    super(props);
    this.state = { error: undefined };
  }
  componentDidCatch(error: Error, info: any) {
    console.error("Error rendering view", this.props.viewName, error, info);
    this.setState({ error: `${error.name}: ${error.message}` });
  }
  render() {
    if (this.state.error !== undefined) {
      return <ErrorState
        inline={this.props.inline}
        viewName={this.props.viewName}
        technicalDetails={this.state.error}
      />;
    }
    return this.props.children;
  }
}


export default ErrorBoundary;
