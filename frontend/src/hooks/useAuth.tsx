/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from 'react';
import {
  handleSetAuthToken,
  handleDeleteAuthToken,
  handleDeleteCurrentUrl,
} from '@/services/auth-cookies';
import { useRouter } from 'next/navigation';
import { queryClient } from '@/services/react-query';
import { toast } from 'sonner';
import { authenticate, AuthenticateProps } from '@/services/api/auth';

export const useAuth = () => {
  const router = useRouter();

  const invalidateQueries = async () => {
    const queryKeys = [''];

    await Promise.all(
      queryKeys.map((key) => queryClient.invalidateQueries({ queryKey: [key] }))
    );
  };

  const handleSignIn = useCallback(
    async ({ email, password }: AuthenticateProps) => {
      try {
        const { data } = await authenticate({
          email,
          password,
        });

        console.log("data", data);

        if (data.token && data.refreshToken) {
          handleSetAuthToken({
            accessToken: data.token,
            refreshToken: data.refreshToken,
            role: data.role,
          });

          window.location.reload();
          await invalidateQueries();
        }
      } catch (error: any) {
        toast('error', error?.message || 'Algo deu errado.');
        throw new Error(error?.message);
      }
    },
    []
  );

  const handleSignOut = useCallback(async () => {
    handleDeleteAuthToken();
    handleDeleteCurrentUrl();
    router.push('/');
  }, [router]);

  return {
    handleSignIn,
    handleSignOut,
  };
};