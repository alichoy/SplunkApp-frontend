import styled from 'styled-components';
import { variables, mixins } from '@splunk/themes';


const MenuDiv = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 2rem;
    margin-bottom: 2rem;
    margin-right: 0.7rem;
    margin-left: 0.7rem;
`;

const SearchContainer = styled.div`
  margin-left: 30rem;
`;


export { 
    MenuDiv, 
    SearchContainer,
 };
