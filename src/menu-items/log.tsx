import { FormattedMessage } from 'react-intl';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import { NavItemType } from 'types';

const icons = {
  ArticleOutlinedIcon
};

const logsPage: NavItemType = {
  id: 'logs-page',
  title: <FormattedMessage id="Log" />,
  icon: icons.ArticleOutlinedIcon,
  type: 'group',
  url: '/logs-page'
};

export default logsPage;
