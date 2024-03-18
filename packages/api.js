import axios from 'axios';

// Base URL for your API endpoints
const baseURL = 'https://s4jdklwk0k.execute-api.us-east-1.amazonaws.com/';

// Function to fetch data from a specific endpoint
export const fetchDataFromEndpoint = async (endpoint) => {
  try {
    const response = await axios.get(`${baseURL}${endpoint}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};