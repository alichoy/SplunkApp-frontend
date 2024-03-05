import React, { useState,useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '@splunk/react-ui/Button';
import Dropdown from '@splunk/react-ui/Dropdown';
import Menu from '@splunk/react-ui/Menu';
import Table from '@splunk/react-ui/Table';
import Multiselect from '@splunk/react-ui/Multiselect';
import { StyledContainer, DropdownMenus } from './DataInventoryComponentStyles';
import Trash from '@splunk/react-icons/enterprise/Trash';

const propTypes = {
    name: PropTypes.string,
};

const DataInventoryComponent = ({ name = 'User' }) => {
     // Initialize state variables using useState
     const [selectedOption1, setSelectedOption1] = useState('All'); // Default to the first item
     const [selectedOption2, setSelectedOption2] = useState('All Hosts'); // Default to the first item
     const [selectedLabels, setSelectedLabels] = useState({}); // Local state for selected labels
     const [selectedClassifications, setSelectedClassifications] = useState({});
   
     // Define menu items for Dropdowns
     const menuItems1 = ['All', 'Alerts', 'Apps', 'Dashboards', 'Reports/Saved Searches', 'Fields', 'Indexes'];
     const menuItems2 = ['All Hosts', 'Host1', 'Host2', 'Host3'];
     const metaLabels = ['label1', 'label2', 'label3', 'label4'];
     const classificationOptions = ['Top Secret/CSI', 'Top Secret', 'Secret', 'Confidential', 'Unclassified'];
   
     // Define functions to handle Dropdown selections
     const handleSelect1 = (option) => {
       setSelectedOption1(option);
     };
   
     const handleSelect2 = (option) => {
       setSelectedOption2(option);
     };
   
     // Handle change in selected labels using Multiselect
     const handleLabelsChange = (id, values) => {
       setSelectedLabels((prevSelectedLabels) => ({
         ...prevSelectedLabels,
         [id]: values,
       }));
     };
   
     // Handle change in selected classification using Dropdown
     const handleClassificationChange = (id, option) => {
       setSelectedClassifications((prevSelectedClassifications) => ({
         ...prevSelectedClassifications,
         [id]: option.label,
       }));
     };
   
     // Effect hook to set initial classifications based on data
     useEffect(() => {
       const initialClassifications = data.reduce((acc, row) => {
         if (row.classification) {
           acc[row.id] = row.classification;
         }
         return acc;
       }, {});
       setSelectedClassifications(initialClassifications);
     }, []);
   
     // Define toggle functions for Dropdowns and Buttons
     const toggleClassification = (id) => (
       <Button isMenu style={{ width: "8rem" }}>
         {selectedClassifications[id] !== undefined
           ? selectedClassifications[id]
           : data.find((row) => row.id === id)?.classification || 'Select'}
       </Button>
     );
   
     const toggle1 = (
       <Button isMenu style={{ width: "12rem", marginRight: "1.5rem" }}>
         {selectedOption1}
       </Button>
     );
   
     const toggle2 = (
       <Button isMenu style={{ width: "12rem" }}>
         {selectedOption2}
       </Button>
     );
   
     // Sample data for the Table
     const data = [
       { id: 1, name: 'All users', description: ' users lookup', owner: 'admin', metaLabel: [], classification: '' },
       { id: 2, name: 'Main Report', description: 'January sales report', owner: 'user1', metaLabel: [], classification: '' },
       { id: 3, name: '_splunk', description: '_splunkLogs_', owner: 'user2', metaLabel: [], classification: '' },
       { id: 4, name: 'HR Dash', description: 'HR dashboard', owner: 'HR user', metaLabel: [], classification: '' },
       { id: 5, name: 'Sales', description: 'alert', owner: 'admin', metaLabel: [], classification: '' },
       { id: 6, name: '_internal', description: '_splunkLogs_', owner: 'user1', metaLabel: [], classification: '' },
     ];
   
     // Return the JSX for rendering the component
     return (
       <StyledContainer>
         <DropdownMenus>
           {/* Dropdown for menuItems1 */}
             <Dropdown toggle={toggle1} >
                 <Menu style={{ width: 150 }}>
                 {menuItems1.map((item) => (
                     <Menu.Item key={item} onSelect={() => handleSelect1(item)}>
                     {item}
                     </Menu.Item>
                 ))}
                 </Menu>
             </Dropdown>
   
             {/* Dropdown for menuItems2 */}
             <Dropdown toggle={toggle2}>
                 <Menu style={{ width: 120 }}>
                 {menuItems2.map((item) => (
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
               {/* Table rows based on data */}
               {data.map((row) => (
                 <Table.Row key={row.id}>
                   {/* Table cells with data */}
                   <Table.Cell>{row.name}</Table.Cell>
                   <Table.Cell>{row.description}</Table.Cell>
                   <Table.Cell>{row.owner}</Table.Cell>
                   <Table.Cell style={{ width: "10rem"}}>
                     {/* Multiselect for meta labels */}
                     <Multiselect /*style={{ background: '#d1cdf733'}}*/ values={selectedLabels[row.id] || []} onChange={(e, { values }) => handleLabelsChange(row.id, values)} inline>
                       {metaLabels.map((label, index) => (
                         <Multiselect.Option key={index} label={label} value={label} />
                       ))}
                     </Multiselect>
                   </Table.Cell>
                   <Table.Cell align='center'>
                        {/* Dropdown or Button for classification with conditional styling */}
                        {selectedClassifications[row.id] !== undefined ? (
                        <Button
                            style={{
                                backgroundColor:
                                selectedClassifications[row.id] === 'Top Secret' ? 'orange' :
                                selectedClassifications[row.id] === 'Top Secret/SCI' ? 'yellow' :
                                selectedClassifications[row.id] === 'Secret' ? 'red' :
                                selectedClassifications[row.id] === 'Confidential' ? 'blue' :
                                selectedClassifications[row.id] === 'Unclassified' ? 'green' : '',
                            }}>
                            {selectedClassifications[row.id]}
                        </Button>
                        ) : (
                        <Dropdown
                            toggle={toggleClassification(row.id)}
                            onSelect={(option) => handleClassificationChange(row.id, option)}>
                            <Menu style={{ width: 120 }}>
                            {classificationOptions.map((option) => (
                                <Menu.Item key={option} style={
                                    { backgroundColor:
                                        option === 'Top Secret' ? 'orange' :
                                        option === 'Top Secret/SCI' ? 'yellow' :
                                        option === 'Secret' ? 'red' :
                                        option === 'Confidential' ? ' blue' :
                                        option === 'Unclassified' ? 'green' : '', }}>
                                {option}
                                </Menu.Item>
                            ))}
                            </Menu>
                        </Dropdown>
                        )}
                    </Table.Cell>
                   <Table.Cell align='center'><Button style={{ color: 'red' }}><Trash/></Button></Table.Cell>
                 </Table.Row>
               ))}
             </Table.Body>
           </Table>
         </div>
       </StyledContainer>
    );
};

DataInventoryComponent.propTypes = propTypes;

export default DataInventoryComponent;
