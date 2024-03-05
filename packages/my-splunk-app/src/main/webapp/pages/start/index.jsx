import React from 'react';

import layout from '@splunk/react-page';
import MyMainReactComponent from '@splunk/my-main-react-component';
import { getUserTheme } from '@splunk/splunk-utils/themes';

import { StyledContainer, StyledGreeting } from './StartStyles';

getUserTheme()
    .then((theme) => {
        layout(
            <StyledContainer>
                <StyledGreeting>Hello Splunker! Welcome to your App</StyledGreeting>
                <MyMainReactComponent name="from inside MyMainReactComponent" />
            </StyledContainer>,
            {
                theme,
            }
        );
    })
    .catch((e) => {
        const errorEl = document.createElement('span');
        errorEl.innerHTML = e;
        document.body.appendChild(errorEl);
    });
