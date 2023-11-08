import styled from '@emotion/styled';


/**
 * Definition list.
 * Nest wrappers (like divs) with dt and dd within.
 * NOTE: Wrappers are required. Only one DD per DT is allowed.
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
 * Definition list where definitions can be very long
 * and therefore scrollable.
 *
 * Same rule as DL (DT+DD combos must have wrappers).
 *
 * DD with large content can have overflow-y: auto.
 */
export const DLFlex = styled(DL)`
  overflow: hidden;
  display: flex;
  flex-flow: column nowrap;
  > * {
    /** NOTE: CONSTRAINT: Same as surrounding line height. */
    min-height: 1.28em;
  }
`;

export default DL;
