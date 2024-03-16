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

const propTypes = {
  name: PropTypes.string,
};

const KOsComponent = ({ name = 'User', searchValue }) => {

  const [data, setData] = useState([]); // State to hold fetched data
  const [currentPage, setCurrentPage] = useState(1); // Current page number
  const [recordsPerPage] = useState(20); // Number of records per page
  const [categorySelected, setcategorySelected] = useState(null); // Change initial state to null
  const [selectedOption2, setSelectedOption2] = useState('All Hosts'); // Default to the first item
  const [selectedClassifications, setSelectedClassifications] = useState({});
  const [classificationOptions, setClassificationOptions] = useState([]);
  const [metaLabels, setMetaLabels] = useState([]);
  const [selectedLabels, setSelectedLabels] = useState({});
  const [hosts, setHosts] = useState([]);
  const [categories, setCategories] = useState([]);

  // Fetch data from the endpoints
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportsData, appsData, dashboardsData, alertData] = await Promise.all([
          fetchDataFromEndpoint('https://s4jdklwk0k.execute-api.us-east-1.amazonaws.com/'),
          fetchDataFromEndpoint('https://s4jdklwk0k.execute-api.us-east-1.amazonaws.com/apps'),
          fetchDataFromEndpoint('https://s4jdklwk0k.execute-api.us-east-1.amazonaws.com/dashboard'),
          fetchDataFromEndpoint('https://s4jdklwk0k.execute-api.us-east-1.amazonaws.com/alert')
        ]);
        // Merge data from all endpoints into a single array
        setData([...reportsData, ...appsData, ...dashboardsData, ...alertData]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  //--------------- META LABELS ---------------
  useEffect(() => {
    axios.get('https://s4jdklwk0k.execute-api.us-east-1.amazonaws.com/meta-labels')
      .then(response => {
        // Assuming the response data is an array of labels
        setMetaLabels(response.data);
      })
      .catch(error => {
        console.error('Error fetching meta labels:', error);
      });
  }, []); // Empty dependency array to run only once on component mount

  // Handle change in selected labels using Multiselect
  const handleLabelsChange = (id, values) => {
    setSelectedLabels({
      ...selectedLabels,
      [id]: values
    });
  };
  //--------------- META LABELS ---------------

  //--------------- CLASSIFICATIONS ---------------
  useEffect(() => {
    axios.get('https://s4jdklwk0k.execute-api.us-east-1.amazonaws.com/classifications')
        .then(response => {
            setClassificationOptions(response.data);
        })
        .catch(error => {
            console.error('Error fetching classifications:', error);
        });
  }, []);
  //--------------- CLASSIFICATIONS ---------------

  //--------------- HOSTS ---------------
  useEffect(() => {
    axios.get('https://s4jdklwk0k.execute-api.us-east-1.amazonaws.com/host')
      .then(response => {
        // Extract the titles from the response data
        const titles = response.data.map(host => host.title);
        // Update the hosts state with the titles
        setHosts(['All Hosts', ...titles]);
      })
      .catch(error => {
        console.error('Error fetching hosts:', error);
      });
  }, []); // Empty dependency array to run only once on component mount
  //--------------- HOSTS ---------------

  //--------------- CATEGORIES ---------------
  useEffect(() => {
    axios.get('https://s4jdklwk0k.execute-api.us-east-1.amazonaws.com/categories')
      .then(response => {
        // Update the categories state with the category data (id and category_name)
        setCategories(response.data);
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
      });
  }, []);
  //--------------- CATEGORIES ---------------

  // Define toggle functions for Dropdowns and Buttons
  const toggleClassification = (id) => (
    <Button isMenu style={{ width: "8rem" }}>
      {selectedClassifications[id] !== undefined
        ? selectedClassifications[id]
        : data.find((dataItem) => dataItem.id === id)?.classification || 'Select'}
    </Button>
  );

  // Handle change in selected classification using Dropdown
  const handleClassificationChange = (id, option) => {
    setSelectedClassifications((prevSelectedClassifications) => ({
      ...prevSelectedClassifications,
      [id]: option.label,
    }));
  };

  // Function to fetch data from an endpoint
  const fetchDataFromEndpoint = async (endpoint) => {
    const response = await fetch(endpoint);
    const data = await response.json();
    return data;
  };

  // Define functions to handle Dropdown selections
  const handleCategoryDropdown = (categoryId) => {
    const selectedCategory = categories.find(item => item.id === categoryId);
    setcategorySelected(categoryId);
  };

  useEffect(() => {
    console.log('Selected category in use effect:', categorySelected?.category_name);
  }, [categorySelected]);

  const handleSelect2 = (option) => {
    setSelectedOption2(option);
  };

  // Effect hook to set initial classifications based on data
  useEffect(() => {
    const initialClassifications = data.reduce((acc, dataItem) => {
      if (dataItem.classification) {
        acc[dataItem.id] = dataItem.classification;
      }
      return acc;
    }, {});
    setSelectedClassifications(initialClassifications);
  }, [data]);

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

  // Calculate indexes for pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;

  // Define page change handler function
  const handlePageChange = (_, { page }) => {
    setCurrentPage(page);
  };

  // Render data based on selected category
  let filteredData = data;
  if (categorySelected !== null) {
    filteredData = data.filter(dataItem => dataItem.category_id === categorySelected);
  }

  // Get the current records based on pagination and filtered data
  const currentRecords = filteredData.slice(indexOfFirstRecord, indexOfLastRecord);

  // Return the JSX for rendering the component
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
          totalPages={Math.ceil(filteredData.length / recordsPerPage)} // Change to filteredData.length
        />
      </div>
    </StyledContainer>
  );
};

// Define prop types for the component
KOsComponent.propTypes = propTypes;

// Export the component
export default KOsComponent;
