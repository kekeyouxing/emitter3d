import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://www.lightline.space', // Replace with your backend IP and port
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