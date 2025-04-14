'use client';

import React, { useState } from 'react';
import { ChemicalWithRelations } from 'types/chemical';
import { LocationWithRelations } from 'types/location';
import { ResearchGroupWithRelations } from 'types/researchGroup';
import { addChemicalAction } from 'actions/chemical/server-actions/addChemical';
import { deleteChemicalAction } from 'actions/chemical/server-actions/deleteChemical';
import { useRouter } from 'next/navigation';
import AddFormModal from 'sections/AddFormModal';
import ChemForm from 'sections/forms/ChemicalForm';
import QrCodeModal from 'components/modals/QrCodeModal';
import CSVExport from 'ui-component/extended/utils/CSVExport';
import { usePermissions } from '../../hooks/usePermissions';

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
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

// assets
import FilterListIcon from '@mui/icons-material/FilterList';
import ViewColumnTwoToneIcon from '@mui/icons-material/ViewColumnOutlined';
import GetAppTwoToneIcon from '@mui/icons-material/GetAppOutlined';
import VisibilityTwoToneIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/AddTwoTone';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';

interface InventoryPageProps {
  initialChemicals: ChemicalWithRelations[];
  initialLocations: LocationWithRelations[];
  initialResearchGroups: ResearchGroupWithRelations[];
}

const InventoryPage: React.FC<InventoryPageProps> = ({
  initialChemicals,
  initialLocations,
  initialResearchGroups,
}) => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedChemicals, setSelectedChemicals] = useState<number[]>([]);
  const [filteredChemicals, setFilteredChemicals] = useState(initialChemicals);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isQrCodeModalOpen, setIsQrCodeModalOpen] = useState(false);
  const [selectedQrID, setSelectedQrID] = useState<string | null>(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const { canModifyInventory } = usePermissions();

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value.toLowerCase();
    setSearch(searchValue);
    setPage(0);

    // Filter chemicals based on search query
    const filtered = initialChemicals.filter((chemical) => {
      return (
        chemical.chemicalName.toLowerCase().includes(searchValue) ||
        (chemical.qrID && chemical.qrID.toLowerCase().includes(searchValue)) ||
        (chemical.location
          ? `${chemical.location.building} ${chemical.location.room}`.toLowerCase().includes(searchValue)
          : false)
      );
    });

    setFilteredChemicals(filtered);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
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

  const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  const handleSubmitForm = async (formData: FormData) => {
    const result = await addChemicalAction(formData);
    if (!result.error) {
      setSnackbarMessage('Chemical added successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setIsAddModalOpen(false);
      router.refresh();
    } else {
      setSnackbarMessage(`Error: ${result.error}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
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

  const handleDeleteSelected = async () => {
    if (!confirm("Are you sure you want to delete the selected chemical(s)?")) return;

    try {
      const result = await deleteChemicalAction(selectedChemicals);
      if (!result.error) {
        setSnackbarMessage('Selected chemicals deleted successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);

        setSelectedChemicals([]);
        router.refresh();
      } else {
        setSnackbarMessage(`Error: ${result.error}`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error deleting chemicals:', error);
      setSnackbarMessage('An error occurred while deleting chemicals.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const csvHeaders = [
    { label: "QR ID", key: "qrID" },
    { label: "Item Name", key: "chemicalName" },
    { label: "Supplier", key: "supplier" },
    { label: "Quantity", key: "quantity" },
    { label: "Building", key: "building" },
    { label: "Room", key: "room" },
    { label: "Chemical Type", key: "chemicalType" },
    { label: "Owner", key: "owner" },
    { label: "Restriction Status", key: "restrictionStatus" },
    { label: "Sublocation 1", key: "subLocation1" },
    { label: "Sublocation 2", key: "subLocation2" },
    { label: "Sublocation 3", key: "subLocation3" },
    { label: "Sublocation 4", key: "subLocation4" },
    { label: "Description", key: "description" },
  ];

  const csvData = filteredChemicals.map((chemical) => ({
    qrID: chemical.qrID,
    chemicalName: chemical.chemicalName,
    supplier: chemical.supplier,
    quantity: chemical.quantity,
    building: chemical.location ? chemical.location.building : "",
    room: chemical.location ? chemical.location.room : "",
    chemicalType: chemical.chemicalType,
    owner: chemical.researchGroup ? chemical.researchGroup.groupName : "",
    restrictionStatus: chemical.restrictionStatus ? "Restricted" : "Unrestricted",
    subLocation1: chemical.subLocation1,
    subLocation2: chemical.subLocation2,
    subLocation3: chemical.subLocation3,
    subLocation4: chemical.subLocation4,
    description: chemical.description
  }));

  const exportDataFinal =
    selectedChemicals.length > 0
      ? filteredChemicals.filter((chem) => selectedChemicals.includes(chem.chemicalID))
          .map((chemical) => ({
            qrID: chemical.qrID,
            chemicalName: chemical.chemicalName,
            supplier: chemical.supplier,
            quantity: chemical.quantity,
            building: chemical.location?.building || "",
            room: chemical.location?.room || "",
            chemicalType: chemical.chemicalType,
            owner: chemical.researchGroup?.groupName || "",
            restrictionStatus: chemical.restrictionStatus ? "Restricted" : "Unrestricted",
            subLocation1: chemical.subLocation1 || "",
            subLocation2: chemical.subLocation2 || "",
            subLocation3: chemical.subLocation3 || "",
            subLocation4: chemical.subLocation4 || "",
            description: chemical.description || "",
          }))
      : csvData;

  
  return (
    <div>
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
                {selectedChemicals.length > 0 && canModifyInventory && (
                  <Tooltip title="Delete Selected">
                    <IconButton onClick={handleDeleteSelected}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                )}
              <Tooltip title ="Import Inventory">
                  <IconButton>
                      <GetAppTwoToneIcon />
                  </IconButton>
              </Tooltip>
              <Tooltip title="Export CSV">
                <div style={{ display: 'inline-block' }}>
                  <CSVExport 
                    data={exportDataFinal} 
                    headers={csvHeaders} 
                    filename="Inventory.csv" 
                  />
                </div>
              </Tooltip>
              <Tooltip title ="Customise Column">
                  <IconButton>
                      <ViewColumnTwoToneIcon />
                  </IconButton>
              </Tooltip>
              <Tooltip title ="Filter">
                  <IconButton>
                      <FilterListIcon />
                  </IconButton>
              </Tooltip>
              {canModifyInventory && (
                <Tooltip title ="Add Item">
                  <Fab
                      color="primary"
                      size="small"
                      onClick={handleOpenAddModal}
                      sx={{ boxShadow: 'none', ml: 1, width: 32, height: 32, minHeight: 32 }}
                    >
                      <AddIcon />
                    </Fab>
                </Tooltip>
              )}
            </Grid>
          </Grid>
        </CardContent>
        <TableContainer>
          <Table>
            <TableHead>
            <TableRow>
              {canModifyInventory && (
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={selectedChemicals.length > 0 && selectedChemicals.length < initialChemicals.length}
                    checked={selectedChemicals.length === initialChemicals.length && initialChemicals.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedChemicals(initialChemicals.map((chemical) => chemical.chemicalID));
                      } else {
                        setSelectedChemicals([]);
                      }
                    }}
                  />
                </TableCell>
              )}
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
                  {canModifyInventory && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={selectedChemicals.includes(chemical.chemicalID)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedChemicals([...selectedChemicals, chemical.chemicalID]);
                          } else {
                            setSelectedChemicals(selectedChemicals.filter(id => id !== chemical.chemicalID));
                          }
                        }}
                      />
                    </TableCell>
                  )}
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
                    <Tooltip title="Chemical Information">
                      <Link href={`/inventory-page/${chemical.qrID}`} passHref>
                        <IconButton title="View Details">
                          <VisibilityTwoToneIcon /> {/* View details icon*/}
                        </IconButton>
                      </Link>
                    </Tooltip>
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

        <AddFormModal open={isAddModalOpen} onClose={handleCloseAddModal} title="Add Item">
          <ChemForm 
            open={isAddModalOpen} 
            onSubmit={handleSubmitForm} 
            onCancel={handleCloseAddModal} 
            initialLocations={initialLocations}
            initialResearchGroups={initialResearchGroups}
          />
        </AddFormModal>

        <QrCodeModal
          open={isQrCodeModalOpen}
          qrID={selectedQrID || ''}
          onClose={handleQRCodeModalClose}
        />
      </MainCard>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default InventoryPage;


