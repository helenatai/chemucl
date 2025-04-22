import { FormattedMessage } from 'react-intl';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import { NavItemType } from 'types';

const icons = {
  PeopleAltOutlinedIcon
};

const manageUserPage: NavItemType = {
  id: 'user-page',
  title: <FormattedMessage id="User" />,
  type: 'group',
  url: '/user-page',
  icon: icons.PeopleAltOutlinedIcon,
  breadcrumbs: true,
  children: [
    {
      id: 'user-info',
      title: 'User Information',
      type: 'item',
      url: '/user-page/:id',
      breadcrumbs: true,
      target: false
    },
    {
      id: 'research-group',
      title: 'Research Group',
      type: 'item',
      url: '/user-page/research-group',
      breadcrumbs: true,
      target: false,
      children: [
        {
          id: 'research-group-info',
          title: 'Research Group Information',
          type: 'item',
          url: '/user-page/research-group/:groupId',
          breadcrumbs: true,
          target: false
        }
      ]
    }
  ]
};

export default manageUserPage;
