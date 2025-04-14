'use client';

import React, { useState, SyntheticEvent } from 'react';
import { Box, Grid, Tab, Tabs } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import RoleGuard from 'utils/route-guard/RoleGuard';
import { ROLES } from 'constants/roles';

// We'll create two separate child components
import UserTable from './user-table';
import ResearchGroupTable from './research-group-table';

// Types from your queries
import { UserWithRelations } from 'types/user';
import { ResearchGroupWithRelations } from 'types/researchGroup'; 
// or if you want from your queries, adjust accordingly

interface UserPageProps {
  initialUsers: UserWithRelations[];
  initialResearchGroups: ResearchGroupWithRelations[];
}

// TabPanel helper
function TabPanel(props: { children: React.ReactNode; value: number; index: number }) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`usergroup-tabpanel-${index}`}
      aria-labelledby={`usergroup-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `usergroup-tab-${index}`,
    'aria-controls': `usergroup-tabpanel-${index}`
  };
}

const UserPage: React.FC<UserPageProps> = ({ initialUsers, initialResearchGroups }) => {
  const [tabValue, setTabValue] = useState(0);

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <RoleGuard allowedPermissions={[ROLES.ADMIN]} fallbackPath="/inventory-page">
      <MainCard>
        <Grid container spacing={gridSpacing}>
          <Grid item xs={12}>
            {/* TABS */}
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

            {/* TAB PANELS */}
            <TabPanel value={tabValue} index={0}>
              {/* ============ USER TABLE ============ */}
              <UserTable initialUsers={initialUsers} />
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              {/* ============ RESEARCH GROUP TABLE ============ */}
              <ResearchGroupTable initialResearchGroups={initialResearchGroups} />
            </TabPanel>
          </Grid>
        </Grid>
      </MainCard>
    </RoleGuard>
  );
};

export default UserPage;
