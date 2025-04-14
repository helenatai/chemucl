'use client';

import { useSession } from 'next-auth/react';
import { PERMISSIONS, ROLES } from '../constants/roles';

type RoleType = typeof ROLES[keyof typeof ROLES];

export const usePermissions = () => {
  const { data: session } = useSession();
  const userPermission = session?.user?.permission as RoleType | undefined;

  const hasPermission = (permissionGroup: keyof typeof PERMISSIONS): boolean => {
    if (!userPermission) return false;
    return (PERMISSIONS[permissionGroup] as readonly RoleType[]).includes(userPermission);
  };

  return {
    // Inventory permissions
    canViewInventory: hasPermission('INVENTORY_VIEW'),
    canModifyInventory: hasPermission('INVENTORY_MODIFY'),

    // Location permissions
    canViewLocation: hasPermission('LOCATION_VIEW'),
    canModifyLocation: hasPermission('LOCATION_MODIFY'),

    // Log permissions
    canAccessLogs: hasPermission('LOG_ACCESS'),

    // User management permissions
    canManageUsers: hasPermission('USER_ACCESS'),

    // Audit permissions
    canAccessAudit: hasPermission('AUDIT_ACCESS'),
    canModifyAudit: hasPermission('AUDIT_MODIFY'),

    // Generic permission check for custom cases
    hasPermission,

    // Current user's permission
    userPermission
  };
}; 