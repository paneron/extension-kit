import React, { useMemo, useCallback } from 'react';
import styled from '@emotion/styled';


/**
 * Definition list.
 * Nest wrappers (like divs) with dt and dd within
 * (`DLEntry` can be used to save time).
 * NOTE: Wrappers are required. Only one DD per DT is allowed.
 *
 * Doesn’t work in narrow containers if DT and/or DD is too long,
 * since DT and DD always begin on the same line.
 */
const DL = styled.dl`
  margin: 0;
  padding: 0;
  > * {
    display: flex;
    flex-flow: row nowrap;
    > dt {
      font-weight: bold;
      margin-right: .5em;
    }
    > dd {
      margin: 0;
    }
  }
`;


/**
 * For use with `DL`.
 * Specify
 */
export const DLEntry: React.VoidFunctionComponent<{
  term: JSX.Element | JSX.Element[] | string | string[]
  definition: JSX.Element | JSX.Element[] | string | string[]
  style?: React.CSSProperties
  className?: string
  dtStyle?: React.CSSProperties
  dtClassName?: string
  ddStyle?: React.CSSProperties
  ddClassName?: string
}> = function ({
  term, definition,
  style, className,
  dtStyle, dtClassName,
  ddStyle, ddClassName,
}) {

  const DT = useCallback(
    ((t: string | JSX.Element) =>
      <dt className={dtClassName} style={dtStyle}>{t}</dt>),
    [dtClassName, dtStyle]);

  const DD = useCallback(
    ((d: string | JSX.Element) =>
      <dd className={ddClassName} style={ddStyle}>{d}</dd>),
    [dtClassName, dtStyle]);

  const terms: (JSX.Element | string)[] = useMemo(
    (() => Array.isArray(term)
      ? term
      : [term]),
    [term]);

  const definitions: (JSX.Element | string)[] = useMemo(
    (() => Array.isArray(definition)
      ? definition
      : [definition]),
    [definition]);

  return <div className={className} style={style}>
    {terms.map(DT)}
    {definitions.map(DD)}
  </div>
};


/**
 * Definition list where DT and DD can start on separate lines.
 *
 * Doesn’t work well for generic listings where it’s important
 * for a nested object to always start to the right of key
 * (never wrap to below).
 */
export const WrappableDL = styled(DL)`
  > * {
    flex-flow: row wrap;
  }
`;

export default DL;
