'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { getCurrentUser } from 'db/queries/User';

interface DetailedUser {
  id: string;
  name: string;
  email: string;
  permission: string;
  activeStatus: boolean;
  researchGroup: {
    groupName: string;
  } | null;
}

export default function useUser() {
  const { data: session, status } = useSession();
  const [detailedUser, setDetailedUser] = useState<DetailedUser | null>(null);

  useEffect(() => {
    async function fetchUserDetails() {
      if (session?.user?.email) {
        const userData = await getCurrentUser(session.user.email);
        if (userData) {
          setDetailedUser(userData as DetailedUser);
        }
      }
    }

    if (status === 'authenticated') {
      fetchUserDetails();
    }
  }, [session, status]);

  return {
    user: detailedUser || session?.user,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading' || (status === 'authenticated' && !detailedUser),
    isAdmin: detailedUser?.permission === 'ADMIN',
  };
} 