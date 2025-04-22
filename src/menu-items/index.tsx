// project import
import inventoryPage from './inventory';
import locationPage from './location';
import userPage from './user';
import logsPage from './log';
import auditPage from './audit';

// types
import { NavItemType } from 'types';

// ==============================|| MENU ITEMS ||============================== //

const menuItems: { items: NavItemType[] } = {
  items: [inventoryPage, locationPage, userPage, logsPage, auditPage]
};

export default menuItems;
