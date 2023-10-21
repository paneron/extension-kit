import styled from '@emotion/styled';


/**
 * Definition list.
 * Nest wrappers (like divs) with dt and dd within.
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

export default DL;
