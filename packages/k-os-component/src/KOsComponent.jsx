import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '@splunk/react-ui/Button';
import Dropdown from '@splunk/react-ui/Dropdown';
import Menu from '@splunk/react-ui/Menu';
import Table from '@splunk/react-ui/Table';
import Multiselect from '@splunk/react-ui/Multiselect';
import { StyledContainer, DropdownMenus } from './KOsComponentStyles';
import Trash from '@splunk/react-icons/enterprise/Trash';
import Paginator from '@splunk/react-ui/Paginator';
import axios from 'axios';
import { fetchDataFromEndpoint } from '../../api'; // Import fetchDataFromEndpoint function from api.js

const propTypes = {
  name: PropTypes.string,
};

const KOsComponent = ({ name = 'User', searchValue }) => {

  const [filteredData, setFilteredData] = useState([]);
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Current page number
  const [recordsPerPage] = useState(20); // Number of records per page
  const [categories, setCategories] = useState([]);
  const [categorySelected, setCategorySelected] = useState(null);
  const [selectedHost, setselectedHost] = useState('All Hosts');
  const [selectedClassifications, setSelectedClassifications] = useState({});
  const [classificationOptions, setClassificationOptions] = useState([]);
  const [metaLabels, setMetaLabels] = useState([]);
  const [selectedLabels, setSelectedLabels] = useState({});
  const [hosts, setHosts] = useState([]);

  // Fetch data from the endpoints
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [
        reportsData, appsData, dashboardsData, alertData, metaLabelsData, classificationsData, hostsData, categoriesData
      ] = await Promise.all([
        fetchDataFromEndpoint(''),
        fetchDataFromEndpoint('apps'),
        fetchDataFromEndpoint('dashboard'),
        fetchDataFromEndpoint('alert'),
        fetchDataFromEndpoint('meta-labels'),
        fetchDataFromEndpoint('classifications'),
        fetchDataFromEndpoint('host'),
        fetchDataFromEndpoint('categories')
      ]);

      // Merge data from all endpoints into a single array
      setData([...reportsData, ...appsData, ...dashboardsData, ...alertData]);
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
    console.log("toggleClassification being called")
    const classificationId = data.find((dataItem) => dataItem.id === id)?.classification_id;
    if (classificationId !== null && classificationOptions.length > 0) {
      const classification = classificationOptions.find((option) => option.id === classificationId);
      return <Button 
        style={{ 
        width: "8rem",
        backgroundColor: {
        'Top Secret': 'orange',
        'Top Secret/SCI': 'yellow',
        'Secret': 'red',
        'Confidential': 'blue',
        'Unclassified': 'green',
      }[classification.classification_name] }}>{classification.classification_name}</Button>;
    } else {
      return <Button isMenu style={{ width: "8rem" }}>{selectedClassifications[id] !== undefined
        ? selectedClassifications[id]
        : data.find((dataItem) => dataItem.id === id)?.classification || 'Select'}</Button>;
    }
  };

  // Define functions to handle Dropdown selections
  const handleCategoryDropdown = (categoryId) => {
    const selectedCategory = categories.find(item => item.id === categoryId);
    setCategorySelected(categoryId);
  };

  useEffect(() => {
    console.log('Selected category in use effect:', categorySelected?.category_name);
  }, [categorySelected]);

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
    console.log("handleDisableRecord being called")
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
  const handleLabelsChange = (id, label) => {
    console.log("handleLabelsChange is being called, id is: ", id, selectedLabels)

    // Update the selected labels in the state
    setSelectedLabels((prevSelectedLabels) => ({
      ...prevSelectedLabels,
      [id]: label,
    }));

    // Prepare the updated data with the new label IDs
    const updatedData = {
      ...data.find(item => item.id === id),
      meta_label_id: label.id // Assuming the meta_label_id accepts a comma-separated string of label IDs
    };

    // Call function to handle PUT request
    handlePutRequest(id, updatedData);

    // Update the data state with the updated record
    setData(prevData => prevData.map(item => item.id === id ? updatedData : item));

    // Update the filteredData state if the record is currently displayed
    setFilteredData(prevFilteredData => prevFilteredData.map(item => item.id === id ? updatedData : item));
  };

  // Function to handle change in selected classification using Dropdown
  const handleClassificationChange = (id, option) => {
    console.log("handleClassificationChange is being called, id is: ", id, option)
    console.log("classificationOptions", classificationOptions)
    
    setSelectedClassifications((prevSelectedClassifications) => ({
      ...prevSelectedClassifications,
      [id]: option.classification_name, 
    }));

    // Prepare the updated data with the new classification ID
    const updatedData = {
      ...data.find(item => item.id === id),
      classification_id: option.id // Corrected to use option.classification_id
    };

    // Call function to handle PUT request
    handlePutRequest(id, updatedData);

    // Update the data state with the updated record
    setData(prevData => prevData.map(item => item.id === id ? updatedData : item));

    // Update the filteredData state if the record is currently displayed
    setFilteredData(prevFilteredData => prevFilteredData.map(item => item.id === id ? updatedData : item));
  }

  // Function to handle PUT request based on category
  const handlePutRequest = (id, updatedData) => {
    let endpoint;

    // Determine the endpoint based on the category
    switch (updatedData.category_id) {
      case 1:
        endpoint = `https://s4jdklwk0k.execute-api.us-east-1.amazonaws.com/apps/${id}`;
        break;
      case 2:
        endpoint = `https://s4jdklwk0k.execute-api.us-east-1.amazonaws.com/reports/${id}`;
        break;
      case 3:
        endpoint = `https://s4jdklwk0k.execute-api.us-east-1.amazonaws.com/dashboards/${id}`;
        break;
      case 4:
        endpoint = `https://s4jdklwk0k.execute-api.us-east-1.amazonaws.com/alert/${id}`;
        break;
      default:
        console.error('Invalid category ID:', updatedData.category_id);
        return;
    }

    // Send the PUT request to update the record with the classification
    axios.put(endpoint, updatedData)
      .then(response => {
        console.log('Record updated successfully:', response.data);
        // You can update the state or perform any other necessary actions upon successful update
      })
      .catch(error => {
        console.error('Error updating record:', error);
      });
  };

  // Function to handle click on Trash button
  const handleTrashClick = (id) => {
    // Call function to handle PUT request to disable record
    console.log("handleTrashClick being called")
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
            {/* Filter categories to display only those with ids 1, 2, 3, and 4 */}
            {categories
              .filter(item => [1, 2, 3, 4].includes(item.id))
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
                <Table.Cell>{dataItem.title}</Table.Cell>
                <Table.Cell>{dataItem.description}</Table.Cell>
                <Table.Cell>{dataItem.owner}</Table.Cell>
                <Table.Cell style={{ width: "10rem" }}>
                  {/* Multiselect for meta labels */}
                  <Multiselect values={selectedLabels[dataItem.id] || []} onChange={(e, { values }) => handleLabelsChange(dataItem.id, values)} inline>
                    {/* Map over meta labels and render Multiselect.Option */}
                    {metaLabels.map(label => (
                      <Multiselect.Option key={label.id} label={label.label} value={label.label} />
                    ))}
                  </Multiselect>
                </Table.Cell>
                <Table.Cell align='center'>
                  {/* Dropdown or Button for classification with conditional styling */}
                  {selectedClassifications[dataItem.id] !== undefined ? (
                    <Button
                      style={{
                        width: "8rem",
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
                      toggle={toggleClassification(dataItem.id)}>
                      <Menu style={{ width: 120 }}>
                        {classificationOptions.map((option) => (
                          <Menu.Item 
                          key={option.id} 
                          onClick={() => handleClassificationChange(dataItem.id, option)}
                          style={{
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
}

KOsComponent.propTypes = propTypes;

export default KOsComponent;