'use client';

import React, { useState } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import type { AuditRecordWithRelations } from 'types/auditRecord';
import RoleGuard from 'utils/route-guard/RoleGuard';
import { ROLES } from 'constants/roles';

interface AuditLocationChemicalsProps {
  auditID: number;
  records: AuditRecordWithRelations[];
}

const AuditLocationChemicals: React.FC<AuditLocationChemicalsProps> = ({ auditID, records }) => {
  const [search, setSearch] = useState('');
  const [filteredRecords, setFilteredRecords] = useState(records);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Handle search input
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value.toLowerCase();
    setSearch(val);
    setPage(0);

    const filtered = records.filter((r) => {
      const name = r.chemical.chemicalName.toLowerCase();
      const cas = r.chemical.casNumber.toLowerCase();
      return name.includes(val) || cas.includes(val);
    });
    setFilteredRecords(filtered);
  };

  // Handle pagination
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedRecords = filteredRecords.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <RoleGuard allowedPermissions={[ROLES.ADMIN, ROLES.AUDITOR]} fallbackPath="/inventory-page">
      <MainCard>
        <TextField
          placeholder="Search Chemical"
          value={search}
          onChange={handleSearch}
          size="small"
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            )
          }}
        />

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Index</TableCell>
                <TableCell>Chemical</TableCell>
                <TableCell>CAS Number</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRecords.map((rec, idx) => {
                const seqIndex = page * rowsPerPage + idx + 1;
                return (
                  <TableRow key={rec.auditRecordID}>
                    <TableCell>{seqIndex}</TableCell>
                    <TableCell>{rec.chemical.chemicalName}</TableCell>
                    <TableCell>{rec.chemical.casNumber}</TableCell>
                    <TableCell>{rec.status}</TableCell>
                    <TableCell>{rec.auditDate ? new Date(rec.auditDate).toLocaleString() : 'N/A'}</TableCell>
                    <TableCell>{rec.lastAuditDate ? new Date(rec.lastAuditDate).toLocaleString() : 'N/A'}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredRecords.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </MainCard>
    </RoleGuard>
  );
};

export default AuditLocationChemicals;
