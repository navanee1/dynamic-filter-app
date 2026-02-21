import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { employeeData } from '../data/employees';

const axiosInstance = axios.create();
const mock = new MockAdapter(axiosInstance);

// Mock the employees API endpoint
mock.onGet('/api/employees').reply(200, {
  data: employeeData,
  total: employeeData.length,
  success: true,
  message: 'Employees fetched successfully'
});

// Mock endpoint with filtering support (for future enhancements)
mock.onGet(/\/api\/employees\/search.*/).reply((config) => {
  const params = new URLSearchParams(config.url?.split('?')[1]);
  return [200, {
    data: employeeData,
    total: employeeData.length,
    success: true,
    filters: Object.fromEntries(params)
  }];
});

export default axiosInstance;
