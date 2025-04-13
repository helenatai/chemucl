'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

// project imports
import { useEffect } from 'react';
import Loader from 'components/ui-component/Loader';

// types
import { GuardProps } from 'types';

// ==============================|| AUTH GUARD ||============================== //

/**
 * Authentication guard for routes
 * @param {PropTypes.node} children children element/node
 */
const AuthGuard = ({ children }: GuardProps) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isAuthenticated = status === 'authenticated';

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') return <Loader />;

  if (!isAuthenticated) return null;

  return children;
};

export default AuthGuard;
