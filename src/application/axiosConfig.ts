import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://82.156.64.202:8080', // Replace with your backend IP and port
  withCredentials: false, // Include credentials for cross-origin requests if needed
});

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    console.error('Error in Axios request:', error);
    return Promise.reject(error);
  },
);

export default axiosInstance;