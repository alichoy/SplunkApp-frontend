// MyMainReactComponent.jsx
import React, { useState, useEffect } from 'react';
import OverviewComponent from '../../overview-component/src/OverviewComponent'
import KOsComponent from '../../k-os-component/src/KOsComponent';
import DataInventoryComponent from '../../data-inventory-component/src/DataInventoryComponent';
import PropTypes from 'prop-types';
import Button from '@splunk/react-ui/Button';
import Search from '@splunk/react-ui/Search';
import { MenuDiv, SearchContainer } from './MyMainReactComponentStyles';

const propTypes = {
    name: PropTypes.string,
};

const MyMainReactComponent = ({ name = 'User' }) => {
    const [value, setValue] = useState(''); // State for the search box
    const [currentView, setCurrentView] = useState('overview'); // Track the current view
    const [categories, setCategories] = useState([]); // State to hold categories data

    // Fetch categories data from the endpoint
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('https://s4jdklwk0k.execute-api.us-east-1.amazonaws.com/categories');
                const data = await response.json();
                setCategories(data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    // Handles search box
    const handleSearchChange = (e, { value: searchValue }) => {
        setValue(searchValue);
    };

    // Generate options for the search box based on categories data
    const options = categories.map(category => (
        <Search.Option key={category.id} value={category.category_name}/>
    ));

    const goToOverview = () => {
        setCurrentView('overview');
    };

    const goToKOs = () => {
        setCurrentView('kos');
    };

    const goToDataInventory = () => {
        setCurrentView('dataInventory');
    };

    return (
        <div>
            <MenuDiv>
                <Button label="Overview" appearance="primary" onClick={goToOverview} />
                <Button label="KOs" appearance="primary" onClick={goToKOs} />
                <Button label="Data Inventory" appearance="primary" onClick={goToDataInventory} />

                <SearchContainer>
                    <Search inline onChange={handleSearchChange}>
                        {options}
                    </Search>
                </SearchContainer>
            </MenuDiv>

            {/* Conditional rendering based on the current view*/}
            {currentView === 'overview' && <OverviewComponent searchValue={value} />}
            {currentView === 'kos' && <KOsComponent searchValue={value} />}
            {currentView === 'dataInventory' && <DataInventoryComponent searchValue={value} />}
        </div>
    );
};

MyMainReactComponent.propTypes = propTypes;

export default MyMainReactComponent;
