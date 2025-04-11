'use client';

import React, { useState } from 'react';
import { ChemicalWithRelations } from 'types/chemical';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import CardContent from '@mui/material/CardContent';
import MainCard from 'ui-component/cards/MainCard';
import Checkbox from '@mui/material/Checkbox';

interface ChemicalsTableProps {
  chemicals: ChemicalWithRelations[];
}

const ChemicalsTable: React.FC<ChemicalsTableProps> = ({ chemicals }) => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [selectedChemicals, setSelectedChemicals] = useState<number[]>([]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCheckboxChange = (chemicalID: number, checked: boolean) => {
    if (checked) {
      setSelectedChemicals((prev) => [...prev, chemicalID]);
    } else {
      setSelectedChemicals((prev) => prev.filter((id) => id !== chemicalID));
    }
  };

  const handleSelectAllChange = (checked: boolean) => {
    if (checked) {
      setSelectedChemicals(chemicals.map((chemical) => chemical.chemicalID));
    } else {
      setSelectedChemicals([]);
    }
  };

  return (
    <MainCard>
      <CardContent>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                      color="primary"
                      indeterminate={
                        selectedChemicals.length > 0 &&
                        selectedChemicals.length < chemicals.length
                      }
                      checked={
                        chemicals.length > 0 &&
                        selectedChemicals.length === chemicals.length
                      }
                      onChange={(e) => handleSelectAllChange(e.target.checked)}
                    />
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
            </TableRow>
          </TableHead>
          <TableBody>
              {chemicals.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((chemical) => (
                <TableRow key={chemical.chemicalID}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={selectedChemicals.includes(chemical.chemicalID)}
                      onChange={(e) =>
                        handleCheckboxChange(chemical.chemicalID, e.target.checked)
                      }
                    />
                  </TableCell>
                  <TableCell>{chemical.qrID}</TableCell>
                  <TableCell>{chemical.chemicalName}</TableCell>
                  <TableCell>{chemical.supplier}</TableCell>
                  <TableCell>{chemical.quantity}</TableCell>
                  <TableCell>
                    {chemical.location
                      ? `${chemical.location.building} ${chemical.location.room} ${chemical.subLocation1 || ''} ${chemical.subLocation2 || ''} ${chemical.subLocation3 || ''} ${chemical.subLocation4 || ''}`
                      : 'No Location'}
                  </TableCell>
                  <TableCell>{chemical.chemicalType}</TableCell>
                  <TableCell>
                    {chemical.researchGroup ? chemical.researchGroup.groupName : 'No Group'}
                  </TableCell>
                  <TableCell>{chemical.dateAdded?.toLocaleDateString()}</TableCell>
                  <TableCell>{chemical.dateUpdated?.toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={chemicals.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </CardContent>
    </MainCard>
  );
};

export default ChemicalsTable;