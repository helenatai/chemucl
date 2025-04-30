'use client';

import { useState, SyntheticEvent } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// material-ui
import { Box, Tab, Tabs, Grid } from '@mui/material';

// project imports
import LocationInformation from './location-information';
import ChemicalsTable from './chemicals-table';
import MainCard from 'components/ui-component/cards/MainCard';
import { LocationWithRelations } from 'types/location';
import { ChemicalWithRelations } from 'types/chemical';
import { gridSpacing } from 'store/constant';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index} id={`location-tabpanel-${index}`} aria-labelledby={`location-tab-${index}`} {...other}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `location-tab-${index}`,
    'aria-controls': `location-tabpanel-${index}`
  };
}

interface LocationTabsProps {
  location: LocationWithRelations;
  chemicals?: ChemicalWithRelations[];
}

const LocationTabs = ({ location, chemicals = [] }: LocationTabsProps) => {
  const router = useRouter();
  const pathname = usePathname();

  // Set initial tab based on current URL
  const initialTab = pathname.includes('/chemicals') ? 1 : 0;
  const [value, setValue] = useState(initialTab);

  const handleChange = (_event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
    // Update URL based on selected tab
    if (newValue === 0) {
      router.push(`/location-page/${location.qrID}`);
    } else {
      router.push(`/location-page/${location.qrID}/chemicals`);
    }
  };

  return (
    <MainCard>
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <Box sx={{ mb: 3 }}>
            <Tabs value={value} onChange={handleChange} aria-label="location tabs" textColor="primary" indicatorColor="primary">
              <Tab label="Location Information" {...a11yProps(0)} />
              <Tab label="View Chemicals" {...a11yProps(1)} />
            </Tabs>
          </Box>
          <TabPanel value={value} index={0}>
            <LocationInformation location={location} />
          </TabPanel>
          <TabPanel value={value} index={1}>
            <ChemicalsTable chemicals={chemicals} />
          </TabPanel>
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default LocationTabs;
