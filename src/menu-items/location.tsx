import { FormattedMessage } from 'react-intl';
import RoomOutlinedIcon from '@mui/icons-material/RoomOutlined';
import { NavItemType } from 'types';

const icons = {
  RoomOutlinedIcon
};

const locationPage: NavItemType = {
  id: 'location-page',
  title: <FormattedMessage id="Location" />,
  icon: icons.RoomOutlinedIcon,  
  type: 'group',
  url: '/location-page'  
};

export default locationPage;
