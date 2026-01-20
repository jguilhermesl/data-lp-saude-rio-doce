/* eslint-disable @typescript-eslint/no-explicit-any */

import { UserRole } from "@/@types/UserRole";
import { api } from "@/lib/axios";

export interface RefreshTokenResponse {
  data: {
    accessToken: string;
    refreshToken: string;
    role: UserRole
  }
}

export const refreshToken = async (accessToken: string, refreshToken: string) => {
  try {
    const response = await api.post("/refresh-token", { accessToken, refreshToken });
    return response.data as RefreshTokenResponse;
  } catch (error: any) {
    throw new Error(error?.response?.data?.detail || error?.message);
  }
};

export interface AuthenticateResponse {
  data: {
    token: string;
    refreshToken: string;
    role: UserRole
  }
}

export interface AuthenticateProps {
  email: string;
  password: string;
}

export const authenticate = async ({ email, password }: AuthenticateProps) => {
  try {
    const response = await api.post("/auth", { email, password });
    return response.data as AuthenticateResponse;
  } catch (error: any) {
    throw new Error(error?.response?.data?.detail || error?.message);
  }
};

export interface MeProfileResponse {
  data: {
    id: string,
    email: string,
    passwordHash: string,
    role: UserRole,
    name: string,
    phone: string,
    active: boolean,
    createdAt: string,
    updatedAt: string
  }
}

export const meProfile = async () => {
  try {
    const response = await api.get("/auth/me");
    return response.data as AuthenticateResponse;
  } catch (error: any) {
    throw new Error(error?.response?.data?.detail || error?.message);
  }
};