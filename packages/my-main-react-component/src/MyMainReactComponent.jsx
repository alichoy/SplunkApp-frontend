import React, { useState, useEffect } from 'react';
import OverviewComponent from '../../overview-component/src/OverviewComponent'
import KOsComponent from '../../k-os-component/src/KOsComponent';
import DataInventoryComponent from '../../data-inventory-component/src/DataInventoryComponent';
import PropTypes from 'prop-types';
import Button from '@splunk/react-ui/Button';
import Search from '@splunk/react-ui/Search';
import {MenuDiv, SearchContainer } from './MyMainReactComponentStyles';

const propTypes = {
    name: PropTypes.string,
};

const MyMainReactComponent = ({ name = 'User' }) => {
    const [value, setValue] = useState(''); // State for the search box
    const [currentView, setCurrentView] = useState('overview'); // Track the current view

    // Handles search box
    const handleSearchChange = (e, { value: searchValue }) => {
        setValue(searchValue);
    };

    let options;
    if (!value?.length) {
        options = [
            <Search.Option key="apps" value="Apps" />,
            <Search.Option key="dashboards" value="Dashboards" />,
            <Search.Option key="search-reports" value="Search Reports" />,
            <Search.Option key="alerts" value="Alerts" />,
            <Search.Option key="indexes" value="Indexes" />,
            <Search.Option key="lookups" value="Lookups" />,
            <Search.Option key="source-sourcetypes-hosts" value="Source/Sourcetypes/Hosts" />,
        ];
    }

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
                <Button label="Overview" appearance="primary"  onClick={goToOverview}/>
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
            {currentView === 'kos' && <KOsComponent />}
            {currentView === 'dataInventory' && <DataInventoryComponent />}
        </div>
    );
};

MyMainReactComponent.propTypes = propTypes;

export default MyMainReactComponent;
