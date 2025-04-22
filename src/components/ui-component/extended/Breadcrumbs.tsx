'use client';
import { CSSProperties, ReactElement, useEffect, useState } from 'react';

// next
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import MuiBreadcrumbs from '@mui/material/Breadcrumbs';

// project import
import navigation from 'menu-items';
import { findResearchGroupById } from 'db/queries/ResearchGroup';
import { findAuditGeneralByID } from 'db/queries/AuditGeneral';

// assets
import { IconChevronRight, IconTallymark1 } from '@tabler/icons-react';
import AccountTreeTwoToneIcon from '@mui/icons-material/AccountTreeTwoTone';
import HomeTwoToneIcon from '@mui/icons-material/HomeTwoTone';

// types
import { NavItemType, OverrideIcon } from 'types';

interface BreadcrumbLinkProps {
  title: string;
  to?: string;
  icon?: string | OverrideIcon;
}

// ==============================|| BREADCRUMBS TITLE ||============================== //

const BTitle = ({ title }: { title: string }) => {
  return (
    <Grid item>
      <Typography variant="h3" sx={{ fontWeight: 500 }}>
        {title}
      </Typography>
    </Grid>
  );
};

// ==============================|| BREADCRUMBS ||============================== //

export interface BreadCrumbSxProps extends CSSProperties {
  mb?: string;
  bgcolor?: string;
}

interface Props {
  card?: boolean;
  custom?: boolean;
  divider?: boolean;
  heading?: string;
  icon?: boolean;
  icons?: boolean;
  links?: BreadcrumbLinkProps[];
  maxItems?: number;
  rightAlign?: boolean;
  separator?: OverrideIcon;
  title?: boolean;
  titleBottom?: boolean;
  sx?: BreadCrumbSxProps;
}

const Breadcrumbs = ({
  card,
  custom = false,
  divider = false,
  heading,
  icon = true,
  icons,
  links,
  maxItems,
  rightAlign = true,
  separator = IconChevronRight,
  title = true,
  titleBottom,
  sx,
  ...others
}: Props) => {
  const theme = useTheme();
  const pathname = usePathname();
  const [main, setMain] = useState<NavItemType | undefined>();
  const [item, setItem] = useState<NavItemType>();
  const [groupName, setGroupName] = useState<string>('');

  // Check if we're on a subpage by looking for dynamic segments
  const isSubPage = pathname.split('/').length > 2;

  const iconSX = {
    marginRight: 6,
    marginTop: -2,
    width: '1rem',
    height: '1rem',
    color: theme.palette.secondary.main
  };

  const linkSX = {
    display: 'flex',
    color: 'grey.900',
    textDecoration: 'none',
    alignContent: 'center',
    alignItems: 'center'
  };

  let customLocation = pathname;

  useEffect(() => {
    navigation?.items?.map((menu: NavItemType) => {
      if (menu.type && menu.type === 'group') {
        if (menu?.url && menu.url === customLocation) {
          setMain(menu);
          setItem(menu);
        } else {
          getCollapse(menu as { children: NavItemType[]; type?: string });
        }
      }
      return false;
    });

    const fetchData = async () => {
      if (customLocation.startsWith('/user-page/research-group/')) {
        const groupId = pathname.split('/').pop();
        if (groupId) {
          try {
            const group = await findResearchGroupById(parseInt(groupId));
            if (group) {
              setGroupName(group.groupName);
            }
          } catch (error) {
            console.error('Error fetching group name:', error);
          }
        }
      } else if (customLocation.startsWith('/audit-page/')) {
        const segments = pathname.split('/');
        const auditId = segments[2];
        if (auditId) {
          try {
            const audit = await findAuditGeneralByID(parseInt(auditId));
            if (audit) {
              // view chemicals page has more than 3 segments
              if (segments.length > 3) {
                setMain({
                  id: 'audit-page',
                  title: 'Audit',
                  type: 'group',
                  url: '/audit-page',
                  breadcrumbs: true,
                  children: [{
                    id: 'audit-info',
                    title: `Round ${audit.round}`,
                    type: 'item',
                    url: `/audit-page/${auditId}`,
                    breadcrumbs: true
                  }]
                });
                setItem({
                  id: 'audit-chemicals',
                  title: 'View Chemicals',
                  type: 'item',
                  breadcrumbs: true
                });
              } else {
                setMain({
                  id: 'audit-page',
                  title: 'Audit',
                  type: 'group',
                  url: '/audit-page',
                  breadcrumbs: true
                });
                setItem({
                  id: 'audit-info',
                  title: `Round ${audit.round}`,
                  type: 'item',
                  breadcrumbs: true
                });
              }
            }
          } catch (error) {
            console.error('Error fetching audit round:', error);
          }
        }
      }
    };

    fetchData();
  }, [customLocation, pathname]);

  const getCollapse = (menu: NavItemType) => {
    if (!custom && menu.children) {
      menu.children.filter((collapse: NavItemType) => {
        if (collapse.type && collapse.type === 'collapse') {
          getCollapse(collapse as { children: NavItemType[]; type?: string });
          if (collapse.url === customLocation) {
            setMain(collapse);
            setItem(collapse);
          }
        } else if (collapse.type && collapse.type === 'item') {
          const urlPattern = collapse.url?.replace(/:[^/]+/g, '[^/]+');
          if (urlPattern && new RegExp(`^${urlPattern}$`).test(customLocation)) {
            if (customLocation === '/user-page' || customLocation === '/user-page/research-group') {
              setMain(undefined);
              setItem({
                ...collapse,
                title: collapse.id === 'research-group' ? 'Research Group' : 'User'
              });
            }
            else if (customLocation.startsWith('/user-page/research-group/')) {
              const groupId = pathname.split('/').pop() || '';
              const groupName = decodeURIComponent(groupId).replace(/-/g, ' ');
              setMain({
                id: 'research-group',
                title: 'Research Group',
                type: 'item',
                url: '/user-page/research-group',
                breadcrumbs: true
              });
              setItem({
                id: 'research-group-info',
                title: groupName,
                type: 'item',
                breadcrumbs: true
              });
            }
            else if (collapse.id === 'user-info') {
              setMain(menu);
              setItem(collapse);
            }
            else {
              setMain(menu);
              setItem({
                ...collapse,
                title: pathname.split('/').pop()
              });
            }
          }
        }
        return false;
      });
    }
  };

  const SeparatorIcon = separator!;
  const separatorIcon = separator ? <SeparatorIcon stroke={1.5} size="16px" /> : <IconTallymark1 stroke={1.5} size="16px" />;

  let mainContent;
  let itemContent;
  let breadcrumbContent: ReactElement = <Typography />;
  let itemTitle: NavItemType['title'] = '';
  let CollapseIcon;
  let ItemIcon;

  if (main && (main.type === 'collapse' || main.type === 'group')) {
    CollapseIcon = main.icon ? main.icon : AccountTreeTwoToneIcon;
    mainContent = (
      <Link href={main.url || '/'} style={{ textDecoration: 'none' }}>
        <Typography
          variant="subtitle1"
          sx={linkSX}
          color={pathname === main.url ? 'text.primary' : 'text.secondary'}
        >
          {icons && <CollapseIcon style={iconSX} />}
          {main.title}
        </Typography>
      </Link>
    );
  }

  if (!custom && main && (main.type === 'collapse' || main.type === 'group') && main.breadcrumbs === true) {
    breadcrumbContent = (
      <Card sx={card === false ? { mb: 3, bgcolor: 'transparent', ...sx } : { mb: 3, bgcolor: 'background.default', ...sx }} {...others}>
        <Box sx={{ p: 2, pl: card === false ? 0 : 2 }}>
          <Grid
            container
            direction={rightAlign ? 'row' : 'column'}
            justifyContent={rightAlign ? 'space-between' : 'flex-start'}
            alignItems={rightAlign ? 'center' : 'flex-start'}
            spacing={1}
          >
            {title && !titleBottom && <BTitle title={main.title as string} />}
            {isSubPage && (
              <Grid item>
                <MuiBreadcrumbs
                  aria-label="breadcrumb"
                  maxItems={maxItems || 8}
                  separator={separatorIcon}
                  sx={{ '& .MuiBreadcrumbs-separator': { width: 16, ml: 1.25, mr: 1.25 } }}
                >
                  <Typography
                    component={Link}
                    href={main.url || '/'}
                    color="textSecondary"
                    variant="subtitle1"
                    sx={linkSX}
                  >
                    {icons && <HomeTwoToneIcon style={iconSX} />}
                    {main.title}
                  </Typography>
                  {mainContent}
                  {itemContent}
                </MuiBreadcrumbs>
              </Grid>
            )}
            {title && titleBottom && <BTitle title={main.title as string} />}
          </Grid>
        </Box>
        {card === false && divider && <Divider sx={{ mt: 2 }} />}
      </Card>
    );
  }

  if (((item && item.type === 'item') || (item?.type === 'group' && item?.url) || custom)) {
    itemTitle = item?.title;

    ItemIcon = item?.icon ? item.icon : AccountTreeTwoToneIcon;
    itemContent = (
      <Typography variant="subtitle1" sx={{ ...linkSX, color: 'text.primary' }}>
        {icons && <ItemIcon style={iconSX} />}
        {itemTitle}
      </Typography>
    );

    if ((item?.breadcrumbs !== false || custom)) {
      // For main tabs, show only the title without navigation
      if (customLocation === '/user-page' || customLocation === '/user-page/research-group') {
        breadcrumbContent = (
          <Card sx={card === false ? { mb: 3, bgcolor: 'transparent', ...sx } : { mb: 3, bgcolor: 'background.default', ...sx }} {...others}>
            <Box sx={{ p: 2, pl: card === false ? 0 : 2 }}>
              <Grid
                container
                direction={rightAlign ? 'row' : 'column'}
                justifyContent={rightAlign ? 'space-between' : 'flex-start'}
                alignItems={rightAlign ? 'center' : 'flex-start'}
                spacing={1}
              >
                <BTitle title={itemTitle as string} />
              </Grid>
            </Box>
            {card === false && divider !== false && <Divider sx={{ mt: 2 }} />}
          </Card>
        );
      }
      // For subpages, show the full breadcrumb navigation
      else if (isSubPage) {
        const pageTitle = customLocation.startsWith('/user-page/research-group/') ? 'Research Group' : (main?.title as string || '');
        
        breadcrumbContent = (
          <Card sx={card === false ? { mb: 3, bgcolor: 'transparent', ...sx } : { mb: 3, bgcolor: 'background.default', ...sx }} {...others}>
            <Box sx={{ p: 2, pl: card === false ? 0 : 2 }}>
              <Grid
                container
                direction={rightAlign ? 'row' : 'column'}
                justifyContent={rightAlign ? 'space-between' : 'flex-start'}
                alignItems={rightAlign ? 'center' : 'flex-start'}
                spacing={1}
              >
                {title && !titleBottom && <BTitle title={pageTitle} />}
                <Grid item>
                  {customLocation.startsWith('/user-page/research-group/') ? (
                    <MuiBreadcrumbs
                      aria-label="breadcrumb"
                      maxItems={maxItems || 8}
                      separator={separatorIcon}
                      sx={{ '& .MuiBreadcrumbs-separator': { width: 16, ml: 1.25, mr: 1.25 } }}
                    >
                      <Link href="/user-page/research-group" style={{ textDecoration: 'none' }}>
                        <Typography
                          variant="subtitle1"
                          sx={linkSX}
                          color="text.secondary"
                        >
                          Research Group
                        </Typography>
                      </Link>
                      <Typography
                        variant="subtitle1"
                        sx={linkSX}
                        color="text.primary"
                      >
                        {groupName || pathname.split('/').pop()}
                      </Typography>
                    </MuiBreadcrumbs>
                  ) : customLocation.startsWith('/audit-page/') ? (
                    <MuiBreadcrumbs
                      aria-label="breadcrumb"
                      maxItems={maxItems || 8}
                      separator={separatorIcon}
                      sx={{ '& .MuiBreadcrumbs-separator': { width: 16, ml: 1.25, mr: 1.25 } }}
                    >
                      <Link href="/audit-page" style={{ textDecoration: 'none' }}>
                        <Typography
                          variant="subtitle1"
                          sx={linkSX}
                          color="text.secondary"
                        >
                          Audit
                        </Typography>
                      </Link>
                      {main?.children?.[0] && (
                        <Link href={main.children[0].url || '/'} style={{ textDecoration: 'none' }}>
                          <Typography
                            variant="subtitle1"
                            sx={linkSX}
                            color="text.secondary"
                          >
                            {main.children[0].title}
                          </Typography>
                        </Link>
                      )}
                      {itemTitle && (
                        <Typography
                          variant="subtitle1"
                          sx={linkSX}
                          color="text.primary"
                        >
                          {itemTitle}
                        </Typography>
                      )}
                    </MuiBreadcrumbs>
                  ) : (
                    <MuiBreadcrumbs
                      aria-label="breadcrumb"
                      maxItems={maxItems || 8}
                      separator={separatorIcon}
                      sx={{ '& .MuiBreadcrumbs-separator': { width: 16, ml: 1.25, mr: 1.25 } }}
                    >
                      {main && (
                        <Link href={main.url || '/'} style={{ textDecoration: 'none' }}>
                          <Typography
                            variant="subtitle1"
                            sx={linkSX}
                            color="text.secondary"
                          >
                            {main.title}
                          </Typography>
                        </Link>
                      )}
                      {itemTitle && (
                        <Typography
                          variant="subtitle1"
                          sx={linkSX}
                          color="text.primary"
                        >
                          {itemTitle}
                        </Typography>
                      )}
                    </MuiBreadcrumbs>
                  )}
                </Grid>
                {title && titleBottom && <BTitle title={pageTitle} />}
              </Grid>
            </Box>
            {card === false && divider !== false && <Divider sx={{ mt: 2 }} />}
          </Card>
        );
      }
    }
  }

  return breadcrumbContent;
};

export default Breadcrumbs;
