'use client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/services/react-query';
import { ReactNode } from 'react';
interface IAppProps {
  children: ReactNode;
}

export const App = ({ children }: IAppProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      {/* <UserProvider> */}
      {children}
      {/* </UserProvider> */}
    </QueryClientProvider>
  );
};
