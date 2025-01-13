import { FormattedMessage } from 'react-intl';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import { NavItemType } from 'types';

const icons = {
  FactCheckOutlinedIcon
};

const auditPage: NavItemType = {
  id: 'audit-page',
  title: <FormattedMessage id="Audit" />,  
  icon: icons.FactCheckOutlinedIcon,  
  type: 'group',  
  url: '/audit-page'  
};

export default auditPage;
