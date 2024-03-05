import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '@splunk/react-ui/Button';

import { StyledContainer, StyledGreeting, GridLayout } from './OverviewComponentStyles';

const propTypes = {
    name: PropTypes.string,
};

const OverviewComponent = ({ name = 'User' }) => {
    //const [counter, setCounter] = useState(0);
    const [overviewMenu, setOverviewMenu] = useState([]); // Initialize as an array

    useEffect(() => {
        const MenuItems = [
            { id: 1, title: 'Apps' },
            { id: 2, title: 'Dashboards' },
            { id: 3, title: 'Search Reports' },
            { id: 4, title: 'Alerts' },
            { id: 5, title: 'Indexes' },
            { id: 6, title: 'Lookups' },
            { id: 7, title: 'Fields' },
            { id: 8, title: 'Source/Sourcetypes/Hosts' },
        ];

        setOverviewMenu(MenuItems);
    }, []); // Empty dependency array means this effect runs once after the initial render

    /*const message =
        counter === 0
            ? 'You should try clicking the button.'
            : `You've clicked the button ${counter} time${counter > 1 ? 's' : ''}.`;*/

    return (
        <GridLayout>
                {overviewMenu.map((item) => (
                    <StyledContainer key={item.id}>
                        <StyledGreeting data-testid="greeting">
                            {item.title} <h3>{Math.floor(Math.random() * 100) + 1}</h3>
                        </StyledGreeting>
                    </StyledContainer>
                ))}
        </GridLayout>

    );
};

OverviewComponent.propTypes = propTypes;

export default OverviewComponent;
