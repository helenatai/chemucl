import { FormattedMessage } from 'react-intl';
import RoomOutlinedIcon from '@mui/icons-material/RoomOutlined';
import { NavItemType } from 'types';

const icons = {
  RoomOutlinedIcon
};

const locationPage: NavItemType = {
  id: 'location-page',
  title: <FormattedMessage id="Location" />,
  type: 'group',
  url: '/location-page',
  icon: icons.RoomOutlinedIcon,
  breadcrumbs: true,
  children: [
    {
      id: 'location-info',
      title: 'Location Information',
      type: 'item',
      url: '/location-page/:qrID',
      breadcrumbs: true,
      target: false,
      children: [
        {
          id: 'location-chemicals',
          title: 'View Chemicals',
          type: 'item',
          url: '/location-page/:qrID/chemicals',
          breadcrumbs: false,
          target: false
        }
      ]
    }
  ]
};

export default locationPage;
