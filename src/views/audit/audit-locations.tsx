'use client';

import React, { useState } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import { Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { AuditGeneralWithRelations } from 'types/auditGeneral';
import { AuditWithRelations } from 'types/audit';
import { AuditRecordWithRelations } from 'types/auditRecord';
import { gridSpacing } from 'store/constant';
import { useRouter } from 'next/navigation';
import AuditQrScannerModal from 'components/modals/AuditQrScannerModal';
import CSVExport from 'components/ui-component/extended/utils/CSVExport';
import RoleGuard from 'utils/route-guard/RoleGuard';
import { ROLES } from 'constants/roles';

import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import TablePagination from '@mui/material/TablePagination';

interface AuditLocationsProps {
  auditGeneral: AuditGeneralWithRelations | null;
  audits: AuditWithRelations[];
  missingRecords: AuditRecordWithRelations[];
}

const AuditLocations: React.FC<AuditLocationsProps> = ({ auditGeneral, audits, missingRecords }) => {
  const router = useRouter();

  // search and pagination for audits tab
  const [tabIndex, setTabIndex] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filteredAudits, setFilteredAudits] = useState(audits);

  // search and pagination for missing chemicals tab
  const [missingSearch, setMissingSearch] = useState('');
  const [missingPage, setMissingPage] = useState(0);
  const [missingRowsPerPage, setMissingRowsPerPage] = useState(10);

  // state for QR scanner modal
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  // currentAuditRecord holds the Audit record (location) currently being audited
  const [currentAuditRecord, setCurrentAuditRecord] = useState<AuditWithRelations | null>(null);

  // handlers for audit tab
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value.toLowerCase();
    setSearch(searchValue);
    setPage(0);

    const filtered = audits.filter((audit) => {
      // Create a searchable string based on buildingName and room
      const locationStr = audit.location
        ? `${audit.location.buildingName} ${audit.location.room}`.toLowerCase()
        : '';
      return locationStr.includes(searchValue);
    });
    setFilteredAudits(filtered);
  };

  const filteredMissing = missingRecords.filter((rec) => {
    const chemicalName = rec.chemical.chemicalName.toLowerCase();
    const cas = rec.chemical.casNumber.toLowerCase();
    return (
      chemicalName.includes(missingSearch.toLowerCase()) ||
      cas.includes(missingSearch.toLowerCase())
    );
  });

  const currentMissing = filteredMissing.slice(
    missingPage * missingRowsPerPage,
    missingPage * missingRowsPerPage + missingRowsPerPage
  );

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenQrModal = (audit: AuditWithRelations) => {
    setCurrentAuditRecord(audit);
    setIsQrModalOpen(true);
  };

  const handleCloseQrModal = () => {
    setIsQrModalOpen(false);
    setCurrentAuditRecord(null);
  };

  const handleView = (auditGeneralID: number, auditID: number) => {
    router.push(`/audit-page/${auditGeneralID}/${auditID}`);
  };

  const handleLocationVerified = (qrData: string) => {
    console.log('Location verified:', qrData);
    // Optionally, compare with expected QR code for the location.
  };

  const handleChemicalScanned = (qrData: string) => {
    console.log('Chemical scanned:', qrData);
    // TODO: Call a server action to update the corresponding AuditRecord status from "Unaudited" to "Audited"
  };

  const handleCompleteAudit = async () => {
    router.refresh();
  };

  const handlePauseAudit = () => {
    router.refresh();
  };

  // handlers for missing chemicals tab
  const handleMissingSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMissingSearch(event.target.value);
    setMissingPage(0);
  };
  const handleMissingChangePage = (_event: unknown, newPage: number) => {
    setMissingPage(newPage);
  };
  const handleMissingChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMissingRowsPerPage(parseInt(event.target.value, 10));
    setMissingPage(0);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const csvHeaders = [
    { label: "Chemical", key: "chemicalName" },
    { label: "CAS Number", key: "casNumber" },
    { label: "Status", key: "status" },
    { label: "Location", key: "location" },
    { label: "Start Time", key: "startTime" },
    { label: "End Time", key: "endTime" },
  ];

  const csvData = filteredMissing.map((record) => {
    const locationText = record.audit && record.audit.location
      ? `${record.audit.location.building} ${record.audit.location.room}`
      : '';
    return {
      chemicalName: record.chemical.chemicalName,
      casNumber: record.chemical.casNumber,
      status: record.status, 
      location: locationText,
      startTime: record.auditDate ? new Date(record.auditDate).toLocaleString() : '',
      endTime: record.lastAuditDate ? new Date(record.lastAuditDate).toLocaleString() : '',
    };
  });

  const fileName = auditGeneral ? `Audit Report Round ${auditGeneral.round}.csv` : "Audit Report.csv";

  return (
    <RoleGuard allowedPermissions={[ROLES.ADMIN, ROLES.AUDITOR]} fallbackPath="/inventory-page">
      <MainCard title ={auditGeneral?.round ? `Round ${auditGeneral.round}` : 'Audit Locations'}>
        <Grid container spacing={gridSpacing}>
          <Grid item xs={12}>
          <Tabs value={tabIndex} onChange={handleTabChange}>
            <Tab label="Audits" />
            <Tab label="View all missing chemicals" />
          </Tabs>
          <MainCard>
          {/* Tab 0: Audit Information */}
          {tabIndex === 0 && (
            <>
              {/* Search & Add Button Container */}
              <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                {/* Search Bar */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                    placeholder="Search Location"
                    value={search}
                    onChange={handleSearch}
                    size="small"
                  />
                </Grid>
              </Grid>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Index</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Progress</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Start Time</TableCell>
                      <TableCell>End Time</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredAudits.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((audit, index) => (
                      <TableRow key={audit.auditID}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          {audit.location?.buildingName} {audit.location?.room}
                        </TableCell>
                        <TableCell>
                          {audit.finishedCount} / {audit.finishedCount + audit.pendingCount}
                        </TableCell>
                        <TableCell>{audit.status}</TableCell>
                        <TableCell>
                          {audit.startDate ? new Date(audit.startDate).toLocaleString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {audit.lastAuditDate ? new Date(audit.lastAuditDate).toLocaleString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Grid container spacing={2}>
                            <Grid item>
                              <button onClick={() => handleView(auditGeneral?.auditGeneralID!, audit.auditID)}>
                                View Chemicals
                              </button>
                            </Grid>
                            <Grid item>
                              <button onClick={() => handleOpenQrModal(audit)}>
                                Audit
                              </button>
                            </Grid>
                          </Grid>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredAudits.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          )}
          
          {/* Tab 1: Missing Chemicals */}
          {tabIndex === 1 && (
            <>
              <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                    placeholder="Search Missing Chemicals"
                    value={missingSearch}
                    onChange={handleMissingSearch}
                    size="small"
                    sx={{ width: 250}}
                  />
                </Grid>
                <Grid item xs={12} sm={6} sx={{ textAlign: 'right' }}>
                    <CSVExport data={csvData} headers={csvHeaders} filename={fileName} label="Export Report" />
                  </Grid>
              </Grid>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Index</TableCell>
                      <TableCell>Chemical</TableCell>
                      <TableCell>CAS Number</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Start Time</TableCell>
                      <TableCell>End Time</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentMissing.map((record, index) => {
                      const seqIndex = missingPage * missingRowsPerPage + index + 1;
                      return (
                        <TableRow key={record.auditRecordID}>
                          <TableCell>{seqIndex}</TableCell>
                          <TableCell>{record.chemical.chemicalName}</TableCell>
                          <TableCell>{record.chemical.casNumber}</TableCell>
                          <TableCell>
                            {record.audit?.location?.building} {record.audit?.location?.room}
                          </TableCell>
                          <TableCell>
                            {record.auditDate ? new Date(record.auditDate).toLocaleString() : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {record.lastAuditDate ? new Date(record.lastAuditDate).toLocaleString() : 'N/A'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredMissing.length}
                rowsPerPage={missingRowsPerPage}
                page={missingPage}
                onPageChange={handleMissingChangePage}
                onRowsPerPageChange={handleMissingChangeRowsPerPage}
              />
            </>
            )}
          </MainCard>
          </Grid>
        </Grid>

        {/* QR Scanner Modal */}
        {isQrModalOpen && (
          <AuditQrScannerModal
            open={isQrModalOpen}
            auditId={currentAuditRecord!.auditID}
            onClose={handleCloseQrModal}
            onLocationVerified={handleLocationVerified}
            onChemicalScanned={handleChemicalScanned}
            onComplete={handleCompleteAudit}
            onPause={handlePauseAudit}
          />
        )}
      </MainCard>
    </RoleGuard>
  );
};

export default AuditLocations;