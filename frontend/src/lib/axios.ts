import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  validateStatus: (status) => status >= 200 && status <= 299,
  headers: {
    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiTm92byBVc3XDoXJpbyIsInJvbGUiOiJWSUVXRVIiLCJlbWFpbCI6Im5vdm91c3VhcmlvQGV4ZW1wbG8uY29tIiwiaWF0IjoxNzY4NTcwOTczLCJleHAiOjE3NjkxNzU3NzMsInN1YiI6IjQ0NDhlMTZjLWM4ZmYtNDExNC1iNmEwLWMwMmVmM2QzNDFkYiJ9.4mCKx-1wO5F9az9_L32QJbzzxgKQiwQDxL5gQDXuv4E`
  }
});
