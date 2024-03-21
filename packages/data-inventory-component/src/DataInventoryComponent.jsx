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
import { fetchDataFromEndpoint } from '../../api'; // Import fetchDataFromEndpoint function from api.js

const propTypes = {
  name: PropTypes.string,
};

const DataInventoryComponent = ({ name = 'User', searchValue }) => {
  const [filteredData, setFilteredData] = useState([]);
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(20);
  const [categories, setCategories] = useState([]);
  const [categorySelected, setcategorySelected] = useState(null);
  const [selectedHost, setselectedHost] = useState('All Hosts');
  const [selectedClassifications, setSelectedClassifications] = useState({});
  const [classificationOptions, setClassificationOptions] = useState([]);
  const [metaLabels, setMetaLabels] = useState([]);
  const [selectedLabels, setSelectedLabels] = useState({});
  const [hosts, setHosts] = useState([]);

  // Fetch data from API endpoints when component mounts
  useEffect(() => {
    fetchData();
  }, []);

  // Function to fetch data from multiple endpoints
  const fetchData = async () => {
    try {
      const [
        lookupsData, indexesData, sourcesData, sourceTypesData, metaLabelsData, classificationsData, hostsData, categoriesData
      ] = await Promise.all([
        fetchDataFromEndpoint('lookup'),
        fetchDataFromEndpoint('index'),
        fetchDataFromEndpoint('source'),
        fetchDataFromEndpoint('sourcetype'),
        fetchDataFromEndpoint('meta-labels'),
        fetchDataFromEndpoint('classifications'),
        fetchDataFromEndpoint('host'),
        fetchDataFromEndpoint('categories')
      ]);

      // Merge data from all endpoints into a single array
      setData([...lookupsData, ...indexesData, ...hostsData, ...sourcesData, ...sourceTypesData]);
      setMetaLabels(metaLabelsData);
      setClassificationOptions(classificationsData);
      setHosts(['All Hosts', ...hostsData.map(host => host.title)]);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Render data based on selected category and search input
  useEffect(() => {
    let filteredData = data;

    // Apply category filter if a category is selected
    if (categorySelected !== null) {
      filteredData = filteredData.filter(dataItem => dataItem.category_id === categorySelected);
    }

    // Apply search filter if there's a search input
    if (searchValue.trim() !== '') {
      filteredData = filteredData.filter(dataItem =>
        dataItem.title.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    // Update filtered data state
    setFilteredData(filteredData);
  }, [categorySelected, searchValue, data]);

  //toggle functions for Dropdowns and Buttons
  const toggleClassification = (id) => {
    const classificationId = data.find((dataItem) => dataItem.id === id)?.classification_id;
    if (classificationId !== null && classificationOptions.length > 0) {
      const classification = classificationOptions.find((option) => option.id === classificationId);
      return <Button 
        style={{ 
        width: "8rem",
        color: "black",
        backgroundColor: {
          'Top Secret': '#FF9800',
          'Top Secret/SCI': '#FFEB3B',
          'Secret': 'red',
          'Confidential': '#03a9f4',
          'Unclassified': '#8BC34A',
      }[classification.classification_name] }}>{classification.classification_name}</Button>;
    } else {
      return <Button isMenu style={{ width: "8rem" }}>{selectedClassifications[id] !== undefined
        ? selectedClassifications[id]
        : data.find((dataItem) => dataItem.id === id)?.classification || 'Select'}</Button>;
    }
  };

  // Function to handle category dropdown selection
  const handleCategoryDropdown = (categoryId) => {
    const selectedCategory = categories.find(item => item.id === categoryId);
    setcategorySelected(categoryId); // Change this line to use setcategorySelected
  };

  useEffect(() => {
  }, [categorySelected]);

  // Function to handle host dropdown selection
  const handleHostSelect = (option) => {
    setselectedHost(option);
  };

  // Effect hook to set initial classifications and options based on data
  useEffect(() => {
    const initialClassifications = data.reduce((acc, dataItem) => {
      if (dataItem.classification) {
        acc[dataItem.id] = dataItem.classification;
      }
      return acc;
    }, {});
    setSelectedClassifications(initialClassifications);
    setClassificationOptions(classificationOptions); // Use classificationOptions here
  }, [data, classificationOptions]); // Update dependencies

  // Toggle button for host dropdown
  const hostToggle = (
    <Button isMenu style={{ width: "12rem" }}>
      {selectedHost}
    </Button>
  );

  // Toggle button for category dropdown
  const categoryToggle = (
    <Button isMenu style={{ width: "12rem", marginRight: "1.5rem" }}>
      {categorySelected ? categories.find(item => item.id === categorySelected)?.category_name : 'All Categories'}
    </Button>
  );

  // Calculate indexes for pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;

  // Define page change handler function
  const handlePageChange = (_, { page }) => {
    setCurrentPage(page);
  };

  // Render data based on selected category
  useEffect(() => {
    if (categorySelected !== null) {
      setFilteredData(data.filter(dataItem => dataItem.category_id === categorySelected));
    } else {
      // If no category is selected, display all data
      setFilteredData(data);
    }
  }, [categorySelected, data]);

  // Get the current records based on pagination and filtered data
  const currentRecords = filteredData.slice(indexOfFirstRecord, indexOfLastRecord);
  
  //_________________ PUT REQUEST _______________________
  
  // Function to handle PUT request to update disabled column to 1
  const handleDisableRecord = (id) => {
    // Prepare the data to be sent in the PUT request
    const updatedData = {
      ...data.find(item => item.id === id),
      disabled: 1 // Set disabled column to 1
    };

    // Call function to handle PUT request
    handlePutRequest(id, updatedData);

    // Update the data state to remove the disabled record
    setData(prevData => prevData.filter(item => item.id !== id));

    // Update the filteredData state to remove the disabled record if it's currently displayed
    setFilteredData(prevFilteredData => prevFilteredData.filter(item => item.id !== id));
  };

  // Function to handle change in selected labels using Multiselect
  const handleLabelsChange = (id, labels) => {    
    // Extract the IDs of the selected labels
    const labelIds = labels.map(label => label.id);
  
    // Prepare the updated data with the new label IDs
    const updatedData = {
      ...data.find(item => item.id === id),
      meta_label_id: labelIds.length > 0 ? labelIds[0] : null // Assuming the meta_label_id holds only one ID
    };
  
    // Call function to handle PUT request
    handlePutRequest(id, updatedData);
  
    // Update the selected labels in the state
    setSelectedLabels(prevSelectedLabels => ({
      ...prevSelectedLabels,
      [id]: labels
    }));
  
    // Update the data state with the updated record
    setData(prevData => prevData.map(item => item.id === id ? updatedData : item));
  
    // Update the filteredData state if the record is currently displayed
    setFilteredData(prevFilteredData => prevFilteredData.map(item => item.id === id ? updatedData : item));
  };
  

  // Function to handle change in selected classification using Dropdown
  const handleClassificationChange = (id, option) => {
    // Check if "None" option is selected
    if (option === "None") {
        // Update the classification to null
        const updatedData = {
            ...data.find(item => item.id === id),
            classification_id: null
        };
        
        // Call function to handle PUT request
        handlePutRequest(id, updatedData);
        
        // Update the data state with the updated record
        setData(prevData => prevData.map(item => item.id === id ? updatedData : item));
        
        // Update the filteredData state if the record is currently displayed
        setFilteredData(prevFilteredData => prevFilteredData.map(item => item.id === id ? updatedData : item));
    } else {
        setSelectedClassificationOption(option); // Set selected option in state

        setSelectedClassifications((prevSelectedClassifications) => ({
            ...prevSelectedClassifications,
            [id]: option.classification_name, 
        }));

        // Prepare the updated data with the new classification ID
        const updatedData = {
            ...data.find(item => item.id === id),
            classification_id: option.id
        };

        // Call function to handle PUT request
        handlePutRequest(id, updatedData);

        // Update the data state with the updated record
        setData(prevData => prevData.map(item => item.id === id ? updatedData : item));

        // Update the filteredData state if the record is currently displayed
        setFilteredData(prevFilteredData => prevFilteredData.map(item => item.id === id ? updatedData : item));
    }
  }

  // Function to handle PUT request based on category
  const handlePutRequest = (id, updatedData) => {
    let endpoint;

    // Determine the endpoint based on the category
    switch (updatedData.category_id) {
      case 7:
        endpoint = `https://s4jdklwk0k.execute-api.us-east-1.amazonaws.com/index/${id}`;
        break;
      case 5:
        endpoint = `https://s4jdklwk0k.execute-api.us-east-1.amazonaws.com/lookup/${id}`;
        break;
      case 8:
        endpoint = `https://s4jdklwk0k.execute-api.us-east-1.amazonaws.com/source/${id}`;
        break;
      case 9:
        endpoint = `https://s4jdklwk0k.execute-api.us-east-1.amazonaws.com/sourcetype/${id}`;
        break;
      case 10:
        endpoint = `https://s4jdklwk0k.execute-api.us-east-1.amazonaws.com/host/${id}`;
        break;
      default:
        console.error('Invalid category ID:', updatedData.category_id);
        return;
    }

    // Send the PUT request to update the record with the classification
    axios.put(endpoint, updatedData)
      .then(response => {
        // You can update the state or perform any other necessary actions upon successful update
      })
      .catch(error => {
        console.error('Error updating record:', error);
      });
  };

  // Function to handle click on Trash button
  const handleTrashClick = (id) => {
    // Call function to handle PUT request to disable record
    handleDisableRecord(id);
  }; 
  //_________________ PUT REQUEST _______________________
  
  return (
    <StyledContainer>
      <DropdownMenus>
        {/* Dropdown for categories */}
        <Dropdown toggle={categoryToggle} >
          <Menu style={{ width: 150 }}>
            <Menu.Item key={0} onClick={() => handleCategoryDropdown(null)}>
              All Categories
            </Menu.Item>
            {/* Filter categories to display only those with ids 5, 7, 8, 9, and 10 */}
            {categories
              .filter(item => [5, 7, 8, 9, 10].includes(item.id))
              .map((item) => (
                <Menu.Item key={item.id} onClick={() => handleCategoryDropdown(item.id)}>
                  {item.category_name}
                </Menu.Item>
              ))}
          </Menu>
        </Dropdown>

        {/* Dropdown for hosts */}
        <Dropdown toggle={hostToggle}>
          <Menu style={{ width: 120 }}>
            {hosts.map((item) => (
              <Menu.Item key={item} onSelect={() => handleHostSelect(item)}>
                {item}
              </Menu.Item>
            ))}
          </Menu>
        </Dropdown>
      </DropdownMenus>

      <div>
        {/* Table for displaying data */}
        <Table stripeRows>
          <Table.Head>
            {/* Table headers */}
            <Table.HeadCell>Type</Table.HeadCell>
            <Table.HeadCell>Name</Table.HeadCell>
            <Table.HeadCell>Description</Table.HeadCell>
            <Table.HeadCell>Owner</Table.HeadCell>
            <Table.HeadCell>Meta Label</Table.HeadCell>
            <Table.HeadCell align='center'>Classification </Table.HeadCell>
            <Table.HeadCell align='center'>Actions </Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {/* Table rows based on filtered data */}
            {currentRecords.map((dataItem) => (
              <Table.Row key={dataItem.id}>
                {/* Table cells with data */}
                <Table.Cell style={{ color: '#8d7d7dad' }}>
                  {categories.find(category => category.id === dataItem.category_id)?.category_name}
                </Table.Cell>
                <Table.Cell>{dataItem.title}</Table.Cell>
                <Table.Cell>{dataItem.description}</Table.Cell>
                <Table.Cell>{dataItem.owner}</Table.Cell>
                <Table.Cell style={{ width: "10rem" }}>
                  {/* Multiselect for meta labels */}
                  <Multiselect 
                    values={selectedLabels[dataItem.id] || []} 
                    onChange={(e, { values }) => handleLabelsChange(dataItem.id, values)} 
                    inline
                  >
                    {/* Map over meta labels and render Multiselect.Option */}
                    {metaLabels.map(label => (
                      <Multiselect.Option 
                        key={label.id} 
                        label={label.label} 
                        value={label} // Set value to the label object itself
                        selected={(selectedLabels[dataItem.id] || []).some(selectedLabel => selectedLabel.id === label.id)} // Check if label is selected for the record
                      />
                    ))}
                  </Multiselect>
                </Table.Cell>
                <Table.Cell align='center'>
                  {/* Dropdown or Button for classification with conditional styling */}
                  {selectedClassifications[dataItem.id] !== undefined ? (
                    <Button>
                        {selectedClassifications[dataItem.id]}
                    </Button>
                  ) : (
                    <Dropdown
                        toggle={toggleClassification(dataItem.id)}>
                        <Menu style={{ width: 120 }}>
                            {/* Add "None" option */}
                            <Menu.Item 
                                key="none" 
                                onClick={() => handleClassificationChange(dataItem.id, "None")}>
                                None
                            </Menu.Item>
                            {/* Render other classification options */}
                            {classificationOptions.map((option) => (
                                <Menu.Item 
                                    key={option.id} 
                                    onClick={() => handleClassificationChange(dataItem.id, option)}
                                    style={{
                                        color: "black",
                                        backgroundColor: {
                                            'Top Secret': '#FF9800',
                                            'Top Secret/SCI': '#FFEB3B',
                                            'Secret': 'red',
                                            'Confidential': '#03a9f4',
                                            'Unclassified': '#8BC34A',
                                        }[option.classification_name] || '',
                                    }}>
                                    {option.classification_name}
                                </Menu.Item>
                            ))}
                        </Menu>
                    </Dropdown>
                  )}
                </Table.Cell>
                <Table.Cell align='center'><Button style={{ color: 'red' }} onClick={() => handleTrashClick(dataItem.id)}><Trash /></Button></Table.Cell>
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
