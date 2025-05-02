'use client';

import { useSession } from 'next-auth/react';
import { PERMISSIONS, ROLES } from '../constants/roles';

type RoleType = (typeof ROLES)[keyof typeof ROLES];

export const usePermissions = () => {
  const { data: session } = useSession();
  const userPermissions = session?.user?.permission?.split(',').map((p) => p.trim()) as RoleType[] | undefined;

  const hasPermission = (permissionGroup: keyof typeof PERMISSIONS): boolean => {
    if (!userPermissions || userPermissions.length === 0) return false;
    return userPermissions.some((role) => (PERMISSIONS[permissionGroup] as readonly RoleType[]).includes(role));
  };

  const getBaseRole = (): RoleType | undefined => {
    if (!userPermissions || userPermissions.length === 0) return undefined;
    return userPermissions.find((role) => role !== ROLES.AUDITOR);
  };

  const isAuditor = (): boolean => {
    return userPermissions?.includes(ROLES.AUDITOR) || false;
  };

  return {
    canViewInventory: hasPermission('INVENTORY_VIEW'),
    canModifyInventory: hasPermission('INVENTORY_MODIFY'),

    canViewLocation: hasPermission('LOCATION_VIEW'),
    canModifyLocation: hasPermission('LOCATION_MODIFY'),

    canAccessLogs: hasPermission('LOG_ACCESS'),

    canManageUsers: hasPermission('USER_ACCESS'),

    canAccessAudit: hasPermission('AUDIT_ACCESS'),
    canModifyAudit: hasPermission('AUDIT_MODIFY'),

    hasPermission,

    baseRole: getBaseRole(),
    isAuditor: isAuditor(),
    userPermissions
  };
};
