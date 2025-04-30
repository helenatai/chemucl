import { useMemo } from 'react';
import { usePermissions } from './usePermissions';
import menuItems from 'menu-items';

export const useMenuItems = () => {
  const { canViewInventory, canViewLocation, canManageUsers, canAccessLogs, canAccessAudit } = usePermissions();

  const filteredMenuItems = useMemo(() => {
    const items = menuItems.items.filter((item) => {
      switch (item.id) {
        case 'inventory-page':
          return canViewInventory;
        case 'location-page':
          return canViewLocation;
        case 'user-page':
          return canManageUsers;
        case 'logs-page':
          return canAccessLogs;
        case 'audit-page':
          return canAccessAudit;
        default:
          return false;
      }
    });

    return { items };
  }, [canViewInventory, canViewLocation, canManageUsers, canAccessLogs, canAccessAudit]);

  return filteredMenuItems;
};
