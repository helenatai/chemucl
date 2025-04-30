'use client';

import React, { useState, SyntheticEvent, useEffect } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import RoleGuard from 'utils/route-guard/RoleGuard';
import { ROLES } from 'constants/roles';
import { usePathname } from 'next/navigation';

import UserTable from './user-table';
import ResearchGroupTable from './research-group-table';

import { UserWithRelations } from 'types/user';
import { ResearchGroupWithRelations } from 'types/researchGroup';

interface UserPageProps {
  initialUsers: UserWithRelations[];
  initialResearchGroups: ResearchGroupWithRelations[];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`
  };
}

const UserPage: React.FC<UserPageProps> = ({ initialUsers, initialResearchGroups }) => {
  const pathname = usePathname();
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (pathname.includes('/research-group')) {
      setTabValue(1);
    } else {
      setTabValue(0);
    }
  }, [pathname]);

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    if (newValue === 1) {
      window.history.pushState(null, '', '/user-page/research-group');
    } else {
      window.history.pushState(null, '', '/user-page');
    }
  };

  return (
    <RoleGuard allowedPermissions={[ROLES.ADMIN]} fallbackPath="/inventory-page">
      <MainCard>
        <Box>
          <Tabs
            value={tabValue}
            onChange={handleChange}
            variant="scrollable"
            textColor="primary"
            indicatorColor="primary"
            aria-label="User / Research Group Tabs"
            sx={{ mb: 3 }}
          >
            <Tab label="User" {...a11yProps(0)} />
            <Tab label="Research Group" {...a11yProps(1)} />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <UserTable initialUsers={initialUsers} initialResearchGroups={initialResearchGroups} />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <ResearchGroupTable initialResearchGroups={initialResearchGroups} />
          </TabPanel>
        </Box>
      </MainCard>
    </RoleGuard>
  );
};

export default UserPage;
