'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface RoleGuardProps {
  children: ReactNode;
  allowedPermissions: string[];
  fallbackPath?: string;
}

const RoleGuard = ({ children, allowedPermissions, fallbackPath = '/inventory-page' }: RoleGuardProps) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    const userPermission = session.user?.permission;
    if (!userPermission || !allowedPermissions.includes(userPermission)) {
      router.push(fallbackPath);
    }
  }, [status, session, router, allowedPermissions, fallbackPath]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session?.user?.permission || !allowedPermissions.includes(session.user.permission)) {
    return null;
  }

  return <>{children}</>;
};

export default RoleGuard; 