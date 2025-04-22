import { FormattedMessage } from 'react-intl';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import { NavItemType } from 'types';

const icons = {
  Inventory2OutlinedIcon
};

const inventoryPage: NavItemType = {
  id: 'inventory-page',
  title: <FormattedMessage id="Inventory" />,
  type: 'group',
  url: '/inventory-page',
  icon: icons.Inventory2OutlinedIcon,
  breadcrumbs: true,
  children: [
    {
      id: 'chemical-info',
      title: 'Chemical Information',
      type: 'item',
      url: '/inventory-page/:qrID',
      breadcrumbs: true,
      target: false
    }
  ]
};

export default inventoryPage;
