import { FormattedMessage } from 'react-intl';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import { NavItemType } from 'types';

const icons = {
  ArticleOutlinedIcon
};

const logsPage: NavItemType = {
  id: 'logs-page',
  title: <FormattedMessage id="Log" />,
  type: 'group',
  url: '/logs-page',
  icon: icons.ArticleOutlinedIcon,
  breadcrumbs: true,
  children: [
    {
      id: 'log-page',
      title: 'Log Information',
      type: 'item',
      url: '/logs-page/:logID',
      breadcrumbs: true,
      target: false
    }
  ]
};

export default logsPage;
