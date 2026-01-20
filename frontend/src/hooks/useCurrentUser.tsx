/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from '@tanstack/react-query';
import React, { createContext, useContext, ReactNode } from 'react';
import { handleGetAuthToken } from '@/services/auth-cookies';
import { meProfile } from '@/services/api/auth';

interface UserContextType {
  user?: any;
  isAdmin: boolean;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const { accessToken } = handleGetAuthToken();
  const isAuthenticated = accessToken && accessToken !== 'undefined';

  const { data: userProfile, isPending } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => meProfile(),
    enabled: isAuthenticated as boolean, // Only run the query if the user is authenticated
  });

  console.log(userProfile);
  const isAdmin = userProfile?.data?.role === 'ADMIN';

  return (
    <UserContext.Provider
      value={{ user: userProfile?.data, isAdmin, isLoading: isPending }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useCurrentUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useCurrentUser must be used within a UserProvider');
  }
  return context;
};
