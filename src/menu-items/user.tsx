import { FormattedMessage } from 'react-intl';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import { NavItemType } from 'types';

const icons = {
  PeopleAltOutlinedIcon
};

const manageUserPage: NavItemType = {
  id: 'user-page',
  title: <FormattedMessage id="User" />,
  icon: icons.PeopleAltOutlinedIcon,
  type: 'group',
  url: '/user-page'
};

export default manageUserPage;
