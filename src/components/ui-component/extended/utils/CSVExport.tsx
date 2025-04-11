'use client';

// material-ui
import { IconButton } from '@mui/material';
import IosShareIcon from '@mui/icons-material/IosShare';
import Button from '@mui/material/Button';

// third-party
import { CSVLink } from 'react-csv';

// ==============================|| CSV Export ||============================== //

interface CSVExportProps {
  data: any[]; 
  filename: string;
  headers: { label: string; key: string }[];
  label?: string;
}

const CSVExport: React.FC<CSVExportProps> = ({ data, headers, filename, label }) => {
  return (
    <div style={{ display: 'inline-block' }}>
      <CSVLink
        data={data}
        headers={headers}
        filename={filename}
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        {label ? (
          <Button variant="contained" color="primary">
            {label}
          </Button>
        ) : (
          <IconButton>
            <IosShareIcon />
          </IconButton>
        )}
      </CSVLink>
    </div>
  );
};

export default CSVExport;