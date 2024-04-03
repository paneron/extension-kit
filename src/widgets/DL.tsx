import styled from '@emotion/styled';


/**
 * Definition list.
 * Nest wrappers (like divs) with dt and dd within.
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
 * Definition list where DT and DD can start on separate lines.
 */
export const WrappableDL = styled(DL)`
  > * {
    flex-flow: row wrap;
  }
`;

export default DL;
