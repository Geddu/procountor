import React, { useState, useCallback, useMemo } from "react";
import { Container, Typography, CssBaseline, Box } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import CompanySearch from "./components/CompanySearch";
import CompanyResults from "./components/CompanyResults";
import { CompanySearchParams, Company } from "./types";
import { useCompanies } from "./hooks/useCompanies";

function App() {
  const [searchParams, setSearchParams] = useState<CompanySearchParams>({
    page: 0,
    maxResults: 100,
  });
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // Use React Query hook for companies
  const {
    data: searchResults,
    isLoading: loading,
    isError,
  } = useCompanies(searchParams);

  // Memoize callbacks to prevent them from being recreated on every render
  const handleSearch = useCallback((params: CompanySearchParams) => {
    // Always reset to page 0 when doing a new search
    setSearchParams({
      ...params,
      page: 0,
    });
    setSelectedCompany(null); // Reset selected company when searching
  }, []);

  const handlePageChange = useCallback((params: CompanySearchParams) => {
    setSearchParams(params);
  }, []);

  const handleCompanySelect = useCallback((company: Company) => {
    setSelectedCompany(company);
  }, []);

  // Memoize companies array to prevent unnecessary re-renders
  const companies = useMemo(() => {
    return searchResults?.results || [];
  }, [searchResults?.results]);

  // Memoize the header to prevent it from re-rendering
  const header = useMemo(
    () => (
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Finnish Company Search
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Search for companies in Finland using PRH API
        </Typography>
      </Box>
    ),
    []
  );

  // Memoize the error message
  const errorMessage = useMemo(() => {
    if (!isError) return null;
    return (
      <Box sx={{ mt: 2, p: 2, bgcolor: "error.light", borderRadius: 1 }}>
        <Typography color="error.dark">
          An error occurred while fetching data. Please try again.
        </Typography>
      </Box>
    );
  }, [isError]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {header}

        <CompanySearch onSearch={handleSearch} loading={loading} />

        {errorMessage}

        <CompanyResults
          companies={companies}
          totalResults={searchResults?.totalResults || 0}
          loading={loading}
          currentPage={searchResults?.currentPage || 0}
          onPageChange={handlePageChange}
          searchParams={searchParams}
          selectedCompany={selectedCompany}
          onCompanySelect={handleCompanySelect}
        />
      </Container>
    </LocalizationProvider>
  );
}

export default React.memo(App);
