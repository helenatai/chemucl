import { FormattedMessage } from 'react-intl';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import { NavItemType } from 'types';

const icons = {
  FactCheckOutlinedIcon
};

const auditPage: NavItemType = {
  id: 'audit-page',
  title: <FormattedMessage id="Audit" />,
  type: 'group',
  url: '/audit-page',
  icon: icons.FactCheckOutlinedIcon,
  breadcrumbs: true,
  children: [
    {
      id: 'audit-info',
      title: 'Round',
      type: 'item',
      url: '/audit-page/:auditID',
      breadcrumbs: true,
      target: false,
      children: [
        {
          id: 'audit-chemicals',
          title: 'View Chemicals',
          type: 'item',
          url: '/audit-page/:auditID/:locationID',
          breadcrumbs: true,
          target: false
        }
      ]
    }
  ]
};

export default auditPage;
