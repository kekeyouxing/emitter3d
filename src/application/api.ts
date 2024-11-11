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