// 'use client';

// import { db } from 'db';
// import { useState } from 'react';

// // Material UI Imports
// import Table from '@mui/material/Table';
// import TableBody from '@mui/material/TableBody';
// import TableCell from '@mui/material/TableCell';
// import TableContainer from '@mui/material/TableContainer';
// import TableHead from '@mui/material/TableHead';
// import TableRow from '@mui/material/TableRow';
// import TablePagination from '@mui/material/TablePagination';
// import Checkbox from '@mui/material/Checkbox';
// import IconButton from '@mui/material/IconButton';
// import SearchIcon from '@mui/icons-material/Search';
// import VisibilityTwoToneIcon from '@mui/icons-material/VisibilityTwoTone';
// import TextField from '@mui/material/TextField';
// import InputAdornment from '@mui/material/InputAdornment';
// import MainCard from 'ui-component/cards/MainCard';
// import CardContent from '@mui/material/CardContent';
// import Grid from '@mui/material/Grid';
// import Tooltip from '@mui/material/Tooltip';

// // assets
// import FilterListIcon from '@mui/icons-material/FilterList';
// import ViewColumnTwoToneIcon from '@mui/icons-material/ViewColumnTwoTone';
// import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
// import GetAppTwoToneIcon from '@mui/icons-material/GetAppTwoTone';
// import IosShareIcon from '@mui/icons-material/IosShare';

// // Fetch inventory data
// async function getInventoryData() {
//     const chemicals = await db.chemical.findMany({
//       include: {
//         location: true,
//         researchGroup: true,
//       },
//     });
//     return chemicals;
// }

// const InventoryPage = () => {
//   const [rows, setRows] = useState<any[]>([]);
//   const [search, setSearch] = useState('');
//   const [rowsPerPage, setRowsPerPage] = useState(10);
//   const [page, setPage] = useState(0);
  
//   // Fetch data when the component mounts
// useState(() => {
//         getInventoryData().then((data) => setRows(data));
// });

//   // Search filter
//   const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const searchValue = event.target.value.toLowerCase();
//     setSearch(searchValue);
//     setRows((prevRows) =>
//       prevRows.filter(
//         (row) =>
//           row.itemName.toLowerCase().includes(searchValue) ||
//           row.location.toLowerCase().includes(searchValue) ||
//           row.qrId.toLowerCase().includes(searchValue)
//       )
//     );
//   };

//   const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
//     setPage(newPage);
//   };

//   const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0);
//   };

//   return (
//     <MainCard>
//       <CardContent>
//         <Grid container justifyContent="space-between" alignItems="center" spacing={2}>
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 InputProps={{
//                 startAdornment: (
//                     <InputAdornment position="start">
//                     <SearchIcon fontSize="small" />
//                     </InputAdornment>
//                 )
//                 }} 
//                 sx={{
//                     ml: -1.0,
//                 }}
//                 onChange={handleSearch}
//                 placeholder="Search Item"
//                 value={search}
//                 size="small"
//               />
//             </Grid>
//           <Grid item xs={12} sm={6} sx={{ textAlign: 'right' }}>
//             <Tooltip title ="Import Inventory">
//                 <IconButton>
//                     <GetAppTwoToneIcon /> {/* Import Icon */}
//                 </IconButton>
//             </Tooltip>
//             <Tooltip title ="Export CSV">
//                 <IconButton>
//                     <IosShareIcon /> {/* Export Icon */}
//                 </IconButton>
//             </Tooltip>
//             <Tooltip title ="Customise Column">
//                 <IconButton>
//                     <ViewColumnTwoToneIcon /> {/* Export Icon */}
//                 </IconButton>
//             </Tooltip>
//             <IconButton>
//               <ViewColumnTwoToneIcon /> {/* Customize Columns Icon */}
//             </IconButton>
//             <Tooltip title ="Filter">
//                 <IconButton>
//                     <FilterListIcon /> {/* Export Icon */}
//                 </IconButton>
//             </Tooltip>
//             <IconButton>
//               <AddCircleOutlineIcon /> {/* Add Item Icon */}
//             </IconButton>
//           </Grid>
//         </Grid>
//       </CardContent>

//       <TableContainer>
//         <Table>
//           <TableHead>
//             <TableRow>
//               <TableCell padding="checkbox">
//                 <Checkbox color="primary" />
//               </TableCell>
//               <TableCell>QR ID</TableCell>
//               <TableCell>Item Name</TableCell>
//               <TableCell>Supplier</TableCell>
//               <TableCell align="right">Quantity</TableCell>
//               <TableCell>Location</TableCell>
//               <TableCell>Type</TableCell>
//               <TableCell>Owner</TableCell>
//               <TableCell align="center">Added</TableCell>
//               <TableCell align="center">Updated</TableCell>
//               <TableCell align="center">Action</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
//               <TableRow key={index}>
//                 <TableCell padding="checkbox">
//                   <Checkbox color="primary" />
//                 </TableCell>
//                 <TableCell>{row.qrId}</TableCell>
//                 <TableCell>{row.itemName}</TableCell>
//                 <TableCell>{row.supplier}</TableCell>
//                 <TableCell align="right">{row.quantity}</TableCell>
//                 <TableCell>{row.location}</TableCell>
//                 <TableCell>{row.type}</TableCell>
//                 <TableCell>{row.owner}</TableCell>
//                 <TableCell align="center">{row.added}</TableCell>
//                 <TableCell align="center">{row.updated}</TableCell>
//                 <TableCell align="center">
//                   <IconButton>
//                     <VisibilityTwoToneIcon /> {/* View Details Icon */}
//                   </IconButton>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </TableContainer>

//       <TablePagination
//         rowsPerPageOptions={[5, 10, 25]}
//         component="div"
//         count={rows.length}
//         rowsPerPage={rowsPerPage}
//         page={page}
//         onPageChange={handleChangePage}
//         onRowsPerPageChange={handleChangeRowsPerPage}
//       />
//     </MainCard>
//   );
// };

// export default InventoryPage;

'use client';

import React, { useEffect, useState } from 'react';
import { ChemicalWithRelations } from 'types/chemical';
import { validateAndProcessChemical } from 'services/chemical/chemicalActionHandler';
import AddFormModal from 'sections/AddFormModal';
import ChemForm from 'sections/forms/ChemForm';
import { addChemicalAction } from 'services/chemical/form-actions/addChemical';
import QrCodeModal from 'components/modals/QrCodeModal';

// Material UI Imports
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import MainCard from 'ui-component/cards/MainCard';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Fab from '@mui/material/Fab';

// assets
import FilterListIcon from '@mui/icons-material/FilterList';
import ViewColumnTwoToneIcon from '@mui/icons-material/ViewColumnOutlined';
import GetAppTwoToneIcon from '@mui/icons-material/GetAppOutlined';
import IosShareIcon from '@mui/icons-material/IosShare';
import VisibilityTwoToneIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/AddTwoTone';
import InfoIcon from '@mui/icons-material/InfoOutlined';

const InventoryPage = () => {
  const [chemicals, setChemicals] = useState<ChemicalWithRelations[]>([]); // Full list of chemicals
  const [filteredChemicals, setFilteredChemicals] = useState<ChemicalWithRelations[]>([]); // Filtered chemicals
  const [search, setSearch] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isQrCodeModalOpen, setIsQrCodeModalOpen] = useState(false);
  const [selectedQrID, setSelectedQrID] = useState<string | null>(null);

  // Fetch chemicals from the database
  useEffect(() => {
    const fetchData = async () => {
      const result = await validateAndProcessChemical('find', {
        chemicalName: search,
        page: page + 1,
        rowsPerPage,
      });

      if (!result.error) {
        setChemicals(result.chemicals);
        setFilteredChemicals(result.chemicals); // Set the initial filtered list
      } else {
        console.error('Error fetching chemicals:', result.error);
      }
    };

    fetchData();
  }, [page, rowsPerPage]);

  // Filter chemicals based on the search input
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value.toLowerCase();
    setSearch(searchValue);

    const filtered = chemicals.filter((chemical) => {
      const location = chemical.location
        ? `${chemical.location.building} ${chemical.location.room} ${
            chemical.location.subLocation1 || ''
          } ${chemical.location.subLocation2 || ''} ${
            chemical.location.subLocation3 || ''
          } ${chemical.location.subLocation4 || ''}`.toLowerCase()
        : '';

      return (
        chemical.chemicalName.toLowerCase().includes(searchValue) ||
        (chemical.qrID && chemical.qrID.toLowerCase().includes(searchValue)) ||
        location.includes(searchValue)
      );
    });

    setFilteredChemicals(filtered); // Update the filtered chemicals list
  };

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
     setIsAddModalOpen(false);
   };
  
  const handleSubmitForm = async (formData: FormData) => {
    const result = await addChemicalAction(formData);

    if (!result.error) {
      alert('Chemical added successfully!');
      setIsAddModalOpen(false);
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const handleQRCodeModalOpen = (qrID: string | null| undefined) => {
    if (qrID) {
      setSelectedQrID(qrID);
      setIsQrCodeModalOpen(true);
    } else {
      console.error('Invalid QR ID: QR ID is null or undefined.');
    }
  };
  
  const handleQRCodeModalClose = () => {
    setIsQrCodeModalOpen(false);
    setSelectedQrID(null);
  };

  return (
    <MainCard>
      <CardContent>
        <Grid container justifyContent="space-between" alignItems="center" spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              placeholder="Search Item"
              value={search}
              onChange={handleSearch}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} sx={{ textAlign: 'right' }}>
             <Tooltip title ="Import Inventory">
                 <IconButton>
                     <GetAppTwoToneIcon /> {/* Import Icon */}
                 </IconButton>
             </Tooltip>
             <Tooltip title ="Export CSV">
                 <IconButton>
                     <IosShareIcon /> {/* Export Icon */}
                 </IconButton>
             </Tooltip>
             <Tooltip title ="Customise Column">
                 <IconButton>
                     <ViewColumnTwoToneIcon /> {/* Customize Columns Icon */}
                 </IconButton>
             </Tooltip>
             <Tooltip title ="Filter">
                 <IconButton>
                     <FilterListIcon /> {/* Export Icon */}
                 </IconButton>
             </Tooltip>
             <Tooltip title ="Add Item">
             <Fab
                color="primary"
                size="small"
                onClick={handleOpenAddModal}
                sx={{ boxShadow: 'none', ml: 1, width: 32, height: 32, minHeight: 32 }}
              >
                <AddIcon /> {/* Add Item Icon */}
              </Fab>
             </Tooltip>
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
              <TableCell>Quantity</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Owner</TableCell>
              <TableCell>Added</TableCell>
              <TableCell>Updated</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredChemicals.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((chemical) => (
              <TableRow key={chemical.chemicalID}>
                <TableCell padding="checkbox">
                  <Checkbox color="primary" />
                </TableCell>
                <TableCell>
                  {chemical.qrID}
                  <IconButton
                    onClick={() => handleQRCodeModalOpen(chemical.qrID)}
                    title="View QR Code"
                    >   
                    <InfoIcon sx={{fontSize: '16px'}}/> {/* QR Info Icon */}
                  </IconButton>
                  </TableCell>
                <TableCell>{chemical.chemicalName}</TableCell>
                <TableCell>{chemical.supplier}</TableCell>
                <TableCell>{chemical.quantity}</TableCell>
                <TableCell>
                  {chemical.location
                    ? `${chemical.location.building} ${chemical.location.room}`
                    : 'No Location'}
                </TableCell>
                <TableCell>{chemical.chemicalType}</TableCell>
                <TableCell>
                  {chemical.researchGroup ? chemical.researchGroup.groupName : 'No Group'}
                </TableCell>
                <TableCell>{chemical.dateAdded?.toLocaleDateString()}</TableCell>
                <TableCell>{chemical.dateUpdated?.toLocaleDateString()}</TableCell>
                <TableCell>
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
        count={filteredChemicals.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      <AddFormModal open={isAddModalOpen} onClose={handleCloseAddModal} title="Add Chemical">
        <ChemForm onSubmit={handleSubmitForm} onCancel={handleCloseAddModal} />
      </AddFormModal>

      <QrCodeModal
        open={isQrCodeModalOpen}
        qrID={selectedQrID || ''}
        onClose={handleQRCodeModalClose}
      />

    </MainCard>
  );
};

export default InventoryPage;


