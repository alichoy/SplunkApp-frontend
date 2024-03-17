import React, { useState, useEffect } from 'react'; 
import PropTypes from 'prop-types'; 
import { StyledContainer, StyledGreeting, GridLayout } from './OverviewComponentStyles'; 
import axios from 'axios'; 

const propTypes = {
    name: PropTypes.string, // Define prop types for the component
};

const OverviewComponent = ({ name = 'User', searchValue }) => { 
    const [overviewMenu, setOverviewMenu] = useState([]); // Initialize state for overview menu items

    useEffect(() => { // Side effect to fetch data from multiple endpoints on component mount
        const fetchEndpoints = async () => { // Define asynchronous function to fetch data
            try {
                // Fetch data from multiple endpoints concurrently using Promise.all
                const [reports, apps, dashboards, alerts, lookups, indexes, sources, sourcetypes, hosts] = await Promise.all([
                    fetchData('https://s4jdklwk0k.execute-api.us-east-1.amazonaws.com/'), // Fetch reports data
                    fetchData('https://s4jdklwk0k.execute-api.us-east-1.amazonaws.com/apps'), // Fetch apps data
                    fetchData('https://s4jdklwk0k.execute-api.us-east-1.amazonaws.com/dashboard'), // Fetch dashboards data
                    fetchData('https://s4jdklwk0k.execute-api.us-east-1.amazonaws.com/alert'), // Fetch alerts data
                    fetchData('https://s4jdklwk0k.execute-api.us-east-1.amazonaws.com/lookup'), // Fetch lookups data
                    fetchData('https://s4jdklwk0k.execute-api.us-east-1.amazonaws.com/index'), // Fetch indexes data
                    fetchData('https://s4jdklwk0k.execute-api.us-east-1.amazonaws.com/source'), // Fetch sources data
                    fetchData('https://s4jdklwk0k.execute-api.us-east-1.amazonaws.com/sourcetype'), // Fetch sourcetypes data
                    fetchData('https://s4jdklwk0k.execute-api.us-east-1.amazonaws.com/host') // Fetch hosts data
                ]);

                // Define menu items with titles and counts based on fetched data
                const menuItems = [
                    { id: 1, title: 'Apps', count: apps.length },
                    { id: 2, title: 'Dashboards', count: dashboards.length },
                    { id: 3, title: 'Search Reports', count: reports.length },
                    { id: 4, title: 'Alerts', count: alerts.length },
                    { id: 5, title: 'Indexes', count: indexes.length },
                    { id: 6, title: 'Lookups', count: lookups.length },
                    { id: 7, title: 'Sources', count: sources.length },
                    { id: 8, title: 'SourceTypes', count: sourcetypes.length },
                    { id: 9, title: 'Hosts', count: hosts.length },
                ];

                // Set the menu items in the state
                setOverviewMenu(menuItems);
            } catch (error) { // Catch any errors that occur during data fetching
                console.error('Error fetching data:', error);
            }
        };

        fetchEndpoints(); // Call the function to fetch data from endpoints
    }, []); // Empty dependency array means this effect runs once after the initial render

    // Function to fetch data from an endpoint
    const fetchData = async (endpoint) => {
        const response = await axios.get(endpoint); // Send HTTP GET request to the endpoint
        return response.data; // Return the response data
    };

    // Filter menu items based on search value
    const filteredMenu = overviewMenu.filter((item) =>
        item.title.toLowerCase().includes(searchValue.toLowerCase())
    );

    return (
        <GridLayout>
            {filteredMenu.map((item) => (
                <StyledContainer key={item.id}>
                    <StyledGreeting data-testid="greeting">
                        {item.title} <br /> <h3>{item.count}</h3>
                    </StyledGreeting>
                </StyledContainer>
            ))}
        </GridLayout>
    );
};

OverviewComponent.propTypes = propTypes; 

export default OverviewComponent;
