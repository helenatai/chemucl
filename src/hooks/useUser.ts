'use client';

import { useSession } from 'next-auth/react';

export default function useUser() {
  const { data: session, status } = useSession();

  return {
    user: session?.user,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    isAdmin: session?.user?.permission === 'Admin',
  };
} 