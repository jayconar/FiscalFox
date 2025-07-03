import api from './api';

export const loginUser = async (credentials) => {
  const response = await api.post('/auth/signin', credentials);
  return response.data;
};

export const registerUser = async (userData) => {
    try {
        const response = await api.post('/auth/signup', userData);
        return response.data;
    } catch (error) {
        throw new Error(error.response.data.replace("Error: ", ""));
    }
};
