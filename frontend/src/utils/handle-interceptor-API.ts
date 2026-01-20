/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosInstance } from 'axios';
import {
  handleGetAuthToken,
  handleSetAuthToken,
  handleDeleteAuthToken,
  handleSetCurrentUrl,
} from '@/services/auth-cookies';
import { refreshToken as handleRefreshToken } from '@/services/api/auth';

export const handleInterceptorRequestAPI = (configRequest: any) => {
  const { accessToken } = handleGetAuthToken();

  configRequest.headers.Authorization = `Bearer ${accessToken}`;

  return configRequest;
};

export const handleInterceptorErrorResponseAPI = async (
  api: AxiosInstance,
  error: any
) => {
  const configResponse = error.config;

  if (error.code === 'ERR_NETWORK') {
    error.message = 'Error connecting to server';
  }

  if (error?.response?.data?.error?.message === 'jwt expired' || error?.response?.data?.error?.message === "jwt malformed") {
    configResponse.sent = true;

    try {
      handleSetCurrentUrl(`${window.location.pathname}${window.location.search}`);

      const { refreshToken, accessToken } = handleGetAuthToken();

      const { data } = await handleRefreshToken(accessToken, refreshToken);
      const token = data.accessToken;
      const role = data.role;


      handleSetAuthToken({ accessToken: token, refreshToken, role });

      configResponse.headers = {
        ...configResponse.headers,
        Authorization: `Bearer ${token}`,
      };

      return api(configResponse);
    } catch (error: any) {
      console.error('refetch', error);

      handleDeleteAuthToken();
      window.location.href = '/';
    }
  }

  return Promise.reject(error);
};