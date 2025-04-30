'use client';

import { useSession } from 'next-auth/react';
import { PERMISSIONS, ROLES } from '../constants/roles';

type RoleType = (typeof ROLES)[keyof typeof ROLES];

export const usePermissions = () => {
  const { data: session } = useSession();
  const userPermissions = session?.user?.permission?.split(',').map((p) => p.trim()) as RoleType[] | undefined;

  const hasPermission = (permissionGroup: keyof typeof PERMISSIONS): boolean => {
    if (!userPermissions || userPermissions.length === 0) return false;

    // Check if any of the user's roles are included in the permission group
    return userPermissions.some((role) => (PERMISSIONS[permissionGroup] as readonly RoleType[]).includes(role));
  };

  // Get the base role (excluding Auditor)
  const getBaseRole = (): RoleType | undefined => {
    if (!userPermissions || userPermissions.length === 0) return undefined;
    return userPermissions.find((role) => role !== ROLES.AUDITOR);
  };

  // Check if user has Auditor role
  const isAuditor = (): boolean => {
    return userPermissions?.includes(ROLES.AUDITOR) || false;
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

    // Role information
    baseRole: getBaseRole(),
    isAuditor: isAuditor(),
    userPermissions
  };
};
