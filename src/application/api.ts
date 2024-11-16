import axiosInstance from './axiosConfig';

export const fetchData = async (id: string) => {
  try {
    const response = await axiosInstance.get(`/api/checkId`, { params: { id } });
    debugger
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
};
export const generateOrder = async (id: string, comments: string) => {
  try {
    const response = await axiosInstance.post(`/api/generateOrder`, { id, comments }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
};

export const getTimes = async (id: string) => {
  try {
    const response = await axiosInstance.get(`/api/getTimes`, { params: { id } });
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
};

// getComments
export const getComments = async (id: string) => {
  try {
    const response = await axiosInstance.get(`/api/getComments`, { params: { id } });
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
};