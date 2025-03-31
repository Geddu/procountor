import React, { useState, useMemo, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  CircularProgress,
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from "@mui/material";
import { Company, CompanySearchParams } from "../types";

interface CompanyResultsProps {
  companies: Company[];
  totalResults: number;
  loading: boolean;
  currentPage: number;
  onPageChange: (params: CompanySearchParams) => void;
  searchParams: CompanySearchParams;
  selectedCompany: Company | null;
  onCompanySelect: (company: Company) => void;
}

// Create memoized table row component to prevent re-renders
const CompanyRow = React.memo(
  ({
    company,
    onViewDetails,
  }: {
    company: Company;
    onViewDetails: (company: Company) => void;
  }) => {
    return (
      <TableRow key={company.businessId}>
        <TableCell>{company.businessId}</TableCell>
        <TableCell>{company.name}</TableCell>
        <TableCell>{company.registrationDate}</TableCell>
        <TableCell>{company.endDate}</TableCell>
        <TableCell>
          {company.location ? (
            <Typography variant="body2">
              {company.location.split(" ").map((part, index) => (
                <span key={index}>{index === 0 ? `${part} ` : part}</span>
              ))}
            </Typography>
          ) : (
            "N/A"
          )}
        </TableCell>
        <TableCell>
          <Button
            variant="contained"
            size="small"
            onClick={() => onViewDetails(company)}
          >
            View Details
          </Button>
        </TableCell>
      </TableRow>
    );
  }
);

function CompanyResultsBase({
  companies,
  totalResults,
  loading,
  currentPage,
  onPageChange,
  searchParams,
  selectedCompany,
  onCompanySelect,
}: CompanyResultsProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Memoize the handleChangePage callback
  const handleChangePage = useCallback(
    (_: unknown, newPage: number) => {
      onPageChange({
        ...searchParams,
        page: newPage,
      });
    },
    [onPageChange, searchParams]
  );

  // Memoize the handleViewDetails callback
  const handleViewDetails = useCallback(
    (company: Company) => {
      onCompanySelect(company);
      setDetailsOpen(true);
    },
    [onCompanySelect]
  );

  const handleCloseDetails = useCallback(() => {
    setDetailsOpen(false);
  }, []);

  // Memoize the table rows to prevent re-rendering when other parts change
  const tableRows = useMemo(() => {
    return companies.map((company) => (
      <CompanyRow
        key={company.businessId}
        company={company}
        onViewDetails={handleViewDetails}
      />
    ));
  }, [companies, handleViewDetails]);

  // Memoize the dialog content
  const dialogContent = useMemo(() => {
    if (!selectedCompany) return <Typography>No details available</Typography>;

    return (
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1">Business ID</Typography>
          <Typography variant="body1" gutterBottom>
            {selectedCompany.businessId}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1">Name</Typography>
          <Typography variant="body1" gutterBottom>
            {selectedCompany.name}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1">Registration Date</Typography>
          <Typography variant="body1" gutterBottom>
            {selectedCompany.registrationDate}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1">End Date</Typography>
          <Typography variant="body1" gutterBottom>
            {selectedCompany.endDate || "N/A"}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1">Company Form</Typography>
          <Typography variant="body1" gutterBottom>
            {selectedCompany.companyForm}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1">Location</Typography>
          <Typography variant="body1" gutterBottom>
            {selectedCompany.location}
          </Typography>
        </Grid>
      </Grid>
    );
  }, [selectedCompany]);

  if (loading) {
    // If we already have companies to display, show a partial loading state
    // instead of a full-screen loader when paginating
    if (companies.length > 0) {
      return (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Business ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Registration Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>{tableRows}</TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: "flex", justifyContent: "center", mt: 2, mb: 2 }}>
            <CircularProgress size={30} />
            <Typography variant="body2" sx={{ ml: 2, mt: 0.5 }}>
              Loading page {(searchParams.page || 0) + 1}...
            </Typography>
          </Box>

          <TablePagination
            component="div"
            count={totalResults}
            page={currentPage}
            onPageChange={handleChangePage}
            rowsPerPage={searchParams.maxResults || 100}
            rowsPerPageOptions={[100]}
          />
        </>
      );
    }

    // Full loading state when no data is available yet
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (companies.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="body1">
          No companies found. Try adjusting your search criteria.
        </Typography>
      </Paper>
    );
  }

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Business ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Registration Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{tableRows}</TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={totalResults}
        page={currentPage}
        onPageChange={handleChangePage}
        rowsPerPage={searchParams.maxResults || 100}
        rowsPerPageOptions={[100]}
      />

      {/* Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
        aria-labelledby="company-details-title"
        aria-describedby="company-details-description"
        keepMounted={false}
      >
        <DialogTitle id="company-details-title">Company Details</DialogTitle>
        <DialogContent dividers id="company-details-description">
          {dialogContent}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails} aria-label="Close dialog">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// Wrap the component with React.memo to prevent re-renders when props haven't changed
const CompanyResults = React.memo(CompanyResultsBase);
export default CompanyResults;
