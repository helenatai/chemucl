'use client';

import React, { useEffect, useState } from 'react';
import { ChemicalWithRelations } from 'types/chemical';
import { validateAndProcessChemical } from 'services/chemical/chemicalActionHandler';
import AddFormModal from 'sections/AddFormModal';
import ChemForm from 'sections/forms/ChemForm';
import { addChemicalAction } from 'services/chemical/form-actions/addChemical';
import QrCodeModal from 'components/modals/QrCodeModal';
import { useRouter } from 'next/navigation';

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
import Link from 'next/link';

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
  const [totalCount, setTotalCount] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isQrCodeModalOpen, setIsQrCodeModalOpen] = useState(false);
  const [selectedQrID, setSelectedQrID] = useState<string | null>(null);

  // Fetch chemicals from the database
  useEffect(() => {
    const fetchData = async () => {
      const result = await validateAndProcessChemical('find', {
        chemicalName: search.trim() !== '' ? search : undefined,
        page: page + 1,
        rowsPerPage,
      });

      if (!result.error) {
        setChemicals(result.chemicals);
        setFilteredChemicals(result.chemicals); 
        setTotalCount(result.totalCount?? 0);
      } else {
        console.error('Error fetching chemicals:', result.error);
      }
    };

    fetchData();
  }, [page, rowsPerPage, search]);

  // useEffect(() => {
  //   if (search.trim() === '') {
  //     setFilteredChemicals(chemicals); 
  //   } else {
  //     const filtered = chemicals.filter((chemical) => {
  //       const location = chemical.location
  //         ? `${chemical.location.building} ${chemical.location.room}`.toLowerCase()
  //         : '';
  
  //       return (
  //         chemical.chemicalName.toLowerCase().includes(search.toLowerCase()) ||
  //         (chemical.qrID && chemical.qrID.toLowerCase().includes(search.toLowerCase())) ||
  //         location.includes(search.toLowerCase())
  //       );
  //     });
  
  //     setFilteredChemicals(filtered); 
  //   }
  // }, [search, chemicals]);

  // Filter chemicals based on the search input
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value.toLowerCase();
    setSearch(searchValue);
    setPage(0);

    const filtered = chemicals.filter((chemical) => {
      const location = chemical.location
        ? `${chemical.location.building} ${chemical.location.room}`.toLowerCase()
        : '';

      return (
        chemical.chemicalName.toLowerCase().includes(searchValue) ||
        (chemical.qrID && chemical.qrID.toLowerCase().includes(searchValue)) ||
        location.includes(searchValue)
      );
    });

    setFilteredChemicals(filtered); // Update the filtered chemicals list
  };

  const handleChangePage = (event: unknown, newPage: number) => {
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

  const router = useRouter();

  const handleSubmitForm = async (formData: FormData) => {
    const result = await addChemicalAction(formData);

    if (!result.error) {
      alert('Chemical added successfully!');
      setIsAddModalOpen(false);

      router.refresh();
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
            {filteredChemicals.map((chemical) => (
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
                  <Link href={`/inventory-page/${chemical.qrID}`} passHref>
                    <IconButton title="View Details">
                      <VisibilityTwoToneIcon /> {/* View details icon*/}
                    </IconButton>
                  </Link>
                 </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      <AddFormModal open={isAddModalOpen} onClose={handleCloseAddModal} title="Add Item">
        <ChemForm open={isAddModalOpen} onSubmit={handleSubmitForm} onCancel={handleCloseAddModal} />
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


