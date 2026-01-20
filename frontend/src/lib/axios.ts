import { handleInterceptorErrorResponseAPI, handleInterceptorRequestAPI } from '@/utils/handle-interceptor-API';
import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  validateStatus: (status) => status >= 200 && status <= 299
});

api.interceptors.request.use(async (config) => {
  return handleInterceptorRequestAPI(config);
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    return await handleInterceptorErrorResponseAPI(api, error);
  }
);