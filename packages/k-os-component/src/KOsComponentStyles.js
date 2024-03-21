import styled from 'styled-components';
import { variables, mixins } from '@splunk/themes';

const StyledContainer = styled.div`
    ${mixins.reset('inline-block')};
    font-size: ${variables.fontSizeLarge};
    line-height: 200%;
    margin: ${variables.spacing} ${variables.spacingHalf};
    padding: ${variables.spacing} calc(${variables.spacing} * 2);
    border-radius: ${variables.borderRadius};
    box-shadow: ${variables.overlayShadow};
    background-color: ${variables.backgroundColor};\
    width: 100%;
    padding: 2rem;
`;

const StyledGreeting = styled.div`
    font-weight: bold;
    color: ${variables.brandColor};
    font-size: ${variables.fontSizeXXLarge};
`;

const DropdownMenus = styled.div`
    margin-bottom: 1rem;    
`;

const Dropdown  = styled.div`
    width: 15rem;    
`;

export { StyledContainer, StyledGreeting, DropdownMenus, Dropdown };
