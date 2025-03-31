import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Grid,
  Alert,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs";
import { CompanySearchParams } from "../types";

interface CompanySearchProps {
  onSearch: (params: CompanySearchParams) => void;
  loading: boolean;
}

interface ValidationErrors {
  businessId?: string;
  location?: string;
  dateRange?: string;
  form?: string;
}

const CompanySearch = ({ onSearch, loading }: CompanySearchProps) => {
  const [location, setLocation] = useState<string>("");
  const [businessId, setBusinessId] = useState<string>("");
  const [registrationDateStart, setRegistrationDateStart] =
    useState<Dayjs | null>(null);
  const [registrationDateEnd, setRegistrationDateEnd] = useState<Dayjs | null>(
    null
  );
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Validate business ID format (Finnish business ID: 7 digits, hyphen, check digit)
  const validateBusinessId = (id: string): boolean => {
    if (!id) return true; // Empty is valid (not required)

    const businessIdPattern = /^\d{7}-\d$/;
    return businessIdPattern.test(id);
  };

  // Validate location (town name only - should contain text, not just digits)
  const validateLocation = (loc: string): boolean => {
    if (!loc) return true; // Empty is valid (not required)

    // Town name should contain at least one letter and should not be just numbers
    const townNamePattern = /[a-zA-Z]/;
    return townNamePattern.test(loc) && loc.trim().length > 0;
  };

  // Validate date range (start date should be before or equal to end date)
  const validateDateRange = (): boolean => {
    if (!registrationDateStart || !registrationDateEnd) return true;

    return (
      registrationDateStart.isBefore(registrationDateEnd) ||
      registrationDateStart.isSame(registrationDateEnd)
    );
  };

  // Clear errors when input changes
  useEffect(() => {
    const newErrors: ValidationErrors = {};
    setErrors(newErrors);
  }, [location, businessId, registrationDateStart, registrationDateEnd]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all inputs
    const newErrors: ValidationErrors = {};

    if (businessId && !validateBusinessId(businessId)) {
      newErrors.businessId = "Invalid business ID format. Expected: 1234567-8";
    }

    if (location && !validateLocation(location)) {
      newErrors.location =
        "Please enter a valid town name (must contain letters)";
    }

    if (registrationDateStart && registrationDateEnd && !validateDateRange()) {
      newErrors.dateRange = "Start date must be before or equal to end date";
    }

    // At least one search parameter should be provided
    const hasSearchCriteria =
      businessId.trim() ||
      location.trim() ||
      registrationDateStart ||
      registrationDateEnd;

    if (!hasSearchCriteria) {
      newErrors.form = "Please provide at least one search criteria";
    }

    // Update errors and stop if validation failed
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    const params: CompanySearchParams = {
      location: location.trim() || undefined,
      businessId: businessId.trim() || undefined,
      registrationDateStart: registrationDateStart
        ? registrationDateStart.format("YYYY-MM-DD")
        : undefined,
      registrationDateEnd: registrationDateEnd
        ? registrationDateEnd.format("YYYY-MM-DD")
        : undefined,
      page: 0,
      maxResults: 100,
    };

    onSearch(params);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Search Companies
      </Typography>

      {errors.form && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errors.form}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter town name (e.g. Helsinki)"
              margin="normal"
              error={!!errors.location}
              helperText={errors.location || ""}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Business ID"
              value={businessId}
              onChange={(e) => setBusinessId(e.target.value)}
              placeholder="e.g. 1234567-8"
              margin="normal"
              error={!!errors.businessId}
              helperText={errors.businessId || ""}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Registration Date From"
                value={registrationDateStart}
                onChange={(newValue) => setRegistrationDateStart(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    margin: "normal",
                    error: !!errors.dateRange,
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Registration Date To"
                value={registrationDateEnd}
                onChange={(newValue) => setRegistrationDateEnd(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    margin: "normal",
                    error: !!errors.dateRange,
                    helperText: errors.dateRange || "",
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? "Searching..." : "Search"}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default CompanySearch;
