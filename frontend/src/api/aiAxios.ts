import axios from 'axios';

const aiApi = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

aiApi.interceptors.request.use(
  (config) => {
    // We don't necessarily need a token for the AI engine since it's a standalone microservice,
    // but if it ever gets secured, we can pass it here.
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default aiApi;
