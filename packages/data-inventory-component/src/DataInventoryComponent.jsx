import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '@splunk/react-ui/Button';
import Dropdown from '@splunk/react-ui/Dropdown';
import Menu from '@splunk/react-ui/Menu';
import Table from '@splunk/react-ui/Table';
import Multiselect from '@splunk/react-ui/Multiselect';
import { StyledContainer, DropdownMenus } from './DataInventoryComponentStyles';
import Trash from '@splunk/react-icons/enterprise/Trash';
import Paginator from '@splunk/react-ui/Paginator';
import axios from 'axios';

const propTypes = {
    name: PropTypes.string,
};

const DataInventoryComponent = ({ name = 'User', searchValue }) => {
    const [data, setData] = useState([]); 
    const [currentPage, setCurrentPage] = useState(1); 
    const [recordsPerPage] = useState(20); 
    const [categorySelected, setcategorySelected] = useState(null); 
    const [selectedOption2, setSelectedOption2] = useState('All Hosts'); 
    const [selectedClassifications, setSelectedClassifications] = useState({});
    const [classificationOptions, setClassificationOptions] = useState([]);
    const [metaLabels, setMetaLabels] = useState([]);
    const [selectedLabels, setSelectedLabels] = useState({});
    const [hosts, setHosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filteredData, setFilteredData] = useState([]); // Add this line

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
      try {
        const [lookupsData, indexesData, sourcesData, sourceTypesData, metaLabelsData, classificationsData, hostsData, categoriesData] = await Promise.all([
          fetchDataFromEndpoint('https://s4jdklwk0k.execute-api.us-east-1.amazonaws.com/lookup'),
            fetchDataFromEndpoint('https://s4jdklwk0k.execute-api.us-east-1.amazonaws.com/index'),
            fetchDataFromEndpoint('https://s4jdklwk0k.execute-api.us-east-1.amazonaws.com/source'),
            fetchDataFromEndpoint('https://s4jdklwk0k.execute-api.us-east-1.amazonaws.com/sourcetype'),
            fetchDataFromEndpoint('https://s4jdklwk0k.execute-api.us-east-1.amazonaws.com/meta-labels'),
            fetchDataFromEndpoint('https://s4jdklwk0k.execute-api.us-east-1.amazonaws.com/classifications'),
            fetchDataFromEndpoint('https://s4jdklwk0k.execute-api.us-east-1.amazonaws.com/host'),
            fetchDataFromEndpoint('https://s4jdklwk0k.execute-api.us-east-1.amazonaws.com/categories')
        ]);
          setData([...lookupsData, ...indexesData, ...hostsData, ...sourcesData, ...sourceTypesData]);
          setMetaLabels(metaLabelsData);
          setClassificationOptions(classificationsData);
          setHosts(['All Hosts', ...hostsData.map(host => host.title)]);
          setCategories(categoriesData);
          setFilteredData([...lookupsData, ...indexesData, ...hostsData, ...sourcesData, ...sourceTypesData]); // Add this line
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const fetchDataFromEndpoint = async (endpoint) => {
        const response = await axios.get(endpoint);
        return response.data;
    };

    const handleLabelsChange = (id, values) => {
        setSelectedLabels({
            ...selectedLabels,
            [id]: values
        });

        const updatedData = {
            ...data.find(item => item.id === id),
            meta_label_id: values.map(value => value.id)
        };

        let endpoint;
        switch (updatedData.category_id) {
            case 1:
                endpoint = `https://s4jdklwk0k.execute-api.us-east-1.amazonaws.com/apps/${id}`;
                break;
            case 2:
                endpoint = `https://s4jdklwk0k.execute-api.us-east-1.amazonaws.com/reports/${id}`;
                break;
            case 3:
                endpoint = `https://s4jdklwk0k.execute-api.us-east-1.amazonaws.com/dashboard/${id}`;
                break;
            case 4:
                endpoint = `https://s4jdklwk0k.execute-api.us-east-1.amazonaws.com/alert/${id}`;
                break;
            default:
                console.error('Invalid category ID:', updatedData.category_id);
                return;
        }

        axios.put(endpoint, updatedData)
            .then(response => {
                console.log('Record updated successfully:', response.data);
            })
            .catch(error => {
                console.error('Error updating record:', error);
            });
    };

    const handleClassificationChange = (id, option) => {
        setSelectedClassifications((prevSelectedClassifications) => ({
            ...prevSelectedClassifications,
            [id]: option.label,
        }));
    };

    const handleCategoryDropdown = (categoryId) => {
        setcategorySelected(categoryId);
    };

    const handleSelect2 = (option) => {
        setSelectedOption2(option);
    };

    useEffect(() => {
        const initialClassifications = data.reduce((acc, dataItem) => {
            if (dataItem.classification) {
                acc[dataItem.id] = dataItem.classification;
            }
            return acc;
        }, {});
        setSelectedClassifications(initialClassifications);
    }, [data]);

    const toggleClassification = (id) => (
        <Button isMenu style={{ width: "8rem" }}>
            {selectedClassifications[id] !== undefined
                ? selectedClassifications[id]
                : data.find((dataItem) => dataItem.id === id)?.classification || 'Select'}
        </Button>
    );

    const categoryToggle = (
        <Button isMenu style={{ width: "12rem", marginRight: "1.5rem" }}>
            {categorySelected ? categories.find(item => item.id === categorySelected)?.category_name : 'All Categories'}
        </Button>
    );

    const toggle2 = (
        <Button isMenu style={{ width: "12rem" }}>
            {selectedOption2}
        </Button>
    );

    const handlePageChange = (_, { page }) => {
        setCurrentPage(page);
    };

    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;

    // Update filtered data based on search input
    useEffect(() => {
        let updatedFilteredData = [...data];

        // Apply category filter if a category is selected
        if (categorySelected !== null) {
            updatedFilteredData = updatedFilteredData.filter(dataItem => dataItem.category_id === categorySelected);
        }

        // Apply search filter if there's a search input
        if (searchValue.trim() !== '') {
            updatedFilteredData = updatedFilteredData.filter(dataItem =>
                dataItem.title.toLowerCase().includes(searchValue.toLowerCase())
            );
        }

        // Update filtered data state
        setFilteredData(updatedFilteredData);
    }, [searchValue, categorySelected, data]);

    const currentRecords = filteredData.slice(indexOfFirstRecord, indexOfLastRecord);

    return (
        <StyledContainer>
            <DropdownMenus>
                <Dropdown toggle={categoryToggle} >
                    <Menu style={{ width: 150 }}>
                        <Menu.Item key={0} onClick={() => handleCategoryDropdown(null)}>
                            All Categories
                        </Menu.Item>
                        {categories
                            .filter(item => [5, 7, 8, 9, 10].includes(item.id))
                            .map((item) => (
                                <Menu.Item key={item.id} onClick={() => handleCategoryDropdown(item.id)}>
                                    {item.category_name}
                                </Menu.Item>
                            ))}
                    </Menu>
                </Dropdown>
                <Dropdown toggle={toggle2}>
                    <Menu style={{ width: 120 }}>
                        {hosts.map((item) => (
                            <Menu.Item key={item} onSelect={() => handleSelect2(item)}>
                                {item}
                            </Menu.Item>
                        ))}
                    </Menu>
                </Dropdown>
            </DropdownMenus>
            <div>
                <Table stripeRows>
                    <Table.Head>
                        <Table.HeadCell>Name</Table.HeadCell>
                        <Table.HeadCell>Description</Table.HeadCell>
                        <Table.HeadCell>Owner</Table.HeadCell>
                        <Table.HeadCell>Meta Label</Table.HeadCell>
                        <Table.HeadCell align='center'>Classification </Table.HeadCell>
                        <Table.HeadCell align='center'>Actions </Table.HeadCell>
                    </Table.Head>
                    <Table.Body>
                        {currentRecords.map((dataItem) => (
                            <Table.Row key={dataItem.id}>
                                <Table.Cell>{dataItem.title}</Table.Cell>
                                <Table.Cell>{dataItem.description}</Table.Cell>
                                <Table.Cell>{dataItem.owner}</Table.Cell>
                                <Table.Cell style={{ width: "10rem" }}>
                                    <Multiselect values={selectedLabels[dataItem.id] || []} onChange={(e, { values }) => handleLabelsChange(dataItem.id, values)} inline>
                                        {metaLabels.map(label => (
                                            <Multiselect.Option key={label.id} label={label.label} value={label.label} />
                                        ))}
                                    </Multiselect>
                                </Table.Cell>
                                <Table.Cell align='center'>
                                    {selectedClassifications[dataItem.id] !== undefined ? (
                                        <Button
                                            style={{
                                                backgroundColor: {
                                                    'Top Secret': 'orange',
                                                    'Top Secret/SCI': 'yellow',
                                                    'Secret': 'red',
                                                    'Confidential': 'blue',
                                                    'Unclassified': 'green',
                                                }[selectedClassifications[dataItem.id]] || ''
                                            }}>
                                            {selectedClassifications[dataItem.id]}
                                        </Button>
                                    ) : (
                                        <Dropdown
                                            toggle={toggleClassification(dataItem.id)}
                                            onSelect={(option) => handleClassificationChange(dataItem.id, option)}>
                                            <Menu style={{ width: 120 }}>
                                                {classificationOptions.map((option) => (
                                                    <Menu.Item key={option.id} style={{
                                                        backgroundColor: {
                                                            'Top Secret': 'orange',
                                                            'Top Secret/SCI': 'yellow',
                                                            'Secret': 'red',
                                                            'Confidential': 'blue',
                                                            'Unclassified': 'green',
                                                        }[option.classification_name] || '',
                                                    }}>
                                                        {option.classification_name}
                                                    </Menu.Item>
                                                ))}
                                            </Menu>
                                        </Dropdown>
                                    )}
                                </Table.Cell>
                                <Table.Cell align='center'><Button style={{ color: 'red' }}><Trash /></Button></Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
                <Paginator
                    onChange={handlePageChange}
                    current={currentPage}
                    alwaysShowLastPageLink
                    totalPages={Math.ceil(filteredData.length / recordsPerPage)}
                />
            </div>
        </StyledContainer>
    );
};

DataInventoryComponent.propTypes = propTypes;

export default DataInventoryComponent;
