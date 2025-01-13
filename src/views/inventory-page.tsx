'use client';

import React, { useState } from 'react';

// Material UI Imports
// import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
// import Typography from '@mui/material/Typography';

// Custom UI imports
import MainCard from 'ui-component/cards/MainCard';
// import Chip from 'ui-component/extended/Chip';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import VisibilityTwoToneIcon from '@mui/icons-material/VisibilityTwoTone';
import GetAppTwoToneIcon from '@mui/icons-material/GetAppTwoTone'; // Download Icon
import AutorenewTwoToneIcon from '@mui/icons-material/AutorenewTwoTone'; // Refresh Icon
import ViewColumnTwoToneIcon from '@mui/icons-material/ViewColumnTwoTone'; // Columns Icon
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'; // Add Icon

// Mock inventory data
const mockInventoryData = [
  {
    qrId: 'BBC24',
    itemName: 'Sulfuric Acid',
    supplier: 'Supplier 1',
    quantity: 1,
    location: 'KLLB 105',
    type: 'Chemical',
    owner: 'Genetic Engineering Lab',
    added: '2024-09-15',
    updated: '2024-09-15'
  },
  {
    qrId: 'AAC24',
    itemName: 'Acetone',
    supplier: 'Supplier 1',
    quantity: 1,
    location: 'CPIB 201',
    type: 'Chemical',
    owner: 'Genetic Engineering Lab',
    added: '2024-10-17',
    updated: '2024-10-17'
  },
  {
    qrId: 'BBB24',
    itemName: 'Ethanol',
    supplier: 'Supplier 2',
    quantity: 2,
    location: 'KLLB 105',
    type: 'Chemical',
    owner: 'Genetic Engineering Lab',
    added: '2024-10-29',
    updated: '2024-10-29'
  }
];

const InventoryPage = () => {
  const [search, setSearch] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState(mockInventoryData);

  // Search filter
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value.toLowerCase();
    setSearch(searchValue);
    setRows(
      mockInventoryData.filter(
        (row) =>
          row.itemName.toLowerCase().includes(searchValue) ||
          row.location.toLowerCase().includes(searchValue) ||
          row.qrId.toLowerCase().includes(searchValue)
      )
    );
  };

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <MainCard title="Inventory">
      <CardContent>
        <Grid container justifyContent="space-between" alignItems="center" spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              placeholder="Search"
              value={search}
              onChange={handleSearch}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} sx={{ textAlign: 'right' }}>
            <IconButton>
              <GetAppTwoToneIcon /> {/* Download Icon */}
            </IconButton>
            <IconButton>
              <AutorenewTwoToneIcon /> {/* Refresh Icon */}
            </IconButton>
            <IconButton>
              <ViewColumnTwoToneIcon /> {/* Customize Columns Icon */}
            </IconButton>
            <IconButton>
              <AddCircleOutlineIcon /> {/* Add Item Icon */}
            </IconButton>
          </Grid>
        </Grid>
      </CardContent>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox color="primary" />
              </TableCell>
              <TableCell>QR ID</TableCell>
              <TableCell>Item Name</TableCell>
              <TableCell>Supplier</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Owner</TableCell>
              <TableCell align="center">Added</TableCell>
              <TableCell align="center">Updated</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
              <TableRow key={index}>
                <TableCell padding="checkbox">
                  <Checkbox color="primary" />
                </TableCell>
                <TableCell>{row.qrId}</TableCell>
                <TableCell>{row.itemName}</TableCell>
                <TableCell>{row.supplier}</TableCell>
                <TableCell align="right">{row.quantity}</TableCell>
                <TableCell>{row.location}</TableCell>
                <TableCell>{row.type}</TableCell>
                <TableCell>{row.owner}</TableCell>
                <TableCell align="center">{row.added}</TableCell>
                <TableCell align="center">{row.updated}</TableCell>
                <TableCell align="center">
                  <IconButton>
                    <VisibilityTwoToneIcon /> {/* View Details Icon */}
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </MainCard>
  );
};

export default InventoryPage;
