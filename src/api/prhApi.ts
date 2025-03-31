import { CompanySearchParams, CompanySearchResponse, Company } from "../types";

// Using the correct base URL for the PRH API
const BASE_URL = "https://avoindata.prh.fi/opendata-ytj-api/v3";

// PRH API response types based on the actual schema
interface PRHCompanyAddress {
  street?: string;
  city?: string;
  postCode?: string;
  type?: string;
  country?: string;
  registrationDate?: string;
  endDate?: string;
  postOffices?: Array<{
    city: string;
    languageCode: string;
    municipalityCode: string;
  }>;
  postOfficeBox?: string;
  buildingNumber?: string;
  entrance?: string;
  apartmentNumber?: string;
  apartmentIdSuffix?: string;
  co?: string;
  source?: string;
}

interface PRHCompanyName {
  name?: string;
  language?: string;
  registrationDate?: string;
  endDate?: string;
  source?: string;
  order?: number;
  version?: number;
}

interface PRHBusinessLine {
  code?: string;
  name?: string;
  language?: string;
  registrationDate?: string;
  endDate?: string;
  source?: string;
  order?: number;
  version?: number;
}

interface PRHRegisteredEntry {
  authority?: string;
  register?: string;
  status?: string;
  registrationDate?: string;
  endDate?: string;
  description?: string;
  language?: string;
}

interface PRHCompanyForm {
  name?: string;
  language?: string;
  registrationDate?: string;
  endDate?: string;
  source?: string;
  version?: number;
}

interface PRHCompanySituation {
  type?: string;
  description?: string;
  language?: string;
  registrationDate?: string;
  endDate?: string;
  source?: string;
  version?: number;
}

interface PRHTradeRegisterStatus {
  status?: string;
  description?: string;
  language?: string;
  registrationDate?: string;
  endDate?: string;
}

interface PRHCompanyStatus {
  status?: string;
  description?: string;
  language?: string;
  registrationDate?: string;
  endDate?: string;
}

interface PRHCompanyDetail {
  businessId: string;
  euId?: string;
  names?: PRHCompanyName[];
  mainBusinessLine?: PRHBusinessLine;
  website?: string;
  companyForms?: PRHCompanyForm[];
  companySituations?: PRHCompanySituation[];
  registeredEntries: PRHRegisteredEntry[];
  addresses?: PRHCompanyAddress[];
  tradeRegisterStatus: PRHTradeRegisterStatus;
  status: PRHCompanyStatus;
  registrationDate: string;
  endDate?: string;
  lastModified: string;
}

interface PRHApiResponse {
  totalResults: number;
  companies: PRHCompanyDetail[];
}

// Format the search parameters for the PRH API
export const formatSearchParams = (
  params: CompanySearchParams
): Record<string, string> => {
  const formattedParams: Record<string, string> = {};

  if (params.businessId) {
    formattedParams.businessId = params.businessId;
  }

  if (params.location) {
    formattedParams.location = params.location;
  }

  if (params.registrationDateStart) {
    formattedParams.registrationDateStart = params.registrationDateStart;
  }

  if (params.registrationDateEnd) {
    formattedParams.registrationDateEnd = params.registrationDateEnd;
  }

  // Always include pagination parameters
  formattedParams.totalResults = "true";

  // API uses 1-indexed page numbers, UI uses 0-indexed
  // Page parameter is 1-indexed in the API, we need to add 1 to our 0-indexed page
  formattedParams.page = String((params.page || 0) + 1);

  return formattedParams;
};

// Transform PRH API response to our application format
// This function, while complex, is memoized in the CompanyResults component for optimization
// The API response needs extensive type checking because the API can return data in different structures.
// Just as an example, businessId might be a direct string or an object with a value property.
export const transformResponse = (
  data: PRHApiResponse,
  page = 0,
  maxResults = 100
): CompanySearchResponse => {
  if (!data || !data.companies) {
    console.error("Invalid API response:", data);
    return {
      results: [],
      totalResults: 0,
      currentPage: page,
      totalPages: 0,
    };
  }

  const companies: Company[] = data.companies.map(
    (result: PRHCompanyDetail, index) => {
      try {
        // Find the Finnish name if available
        const finnishName = result.names?.find(
          (name) => name.language === "FI" && !name.endDate
        );
        // Or use the first name available
        const primaryName =
          finnishName?.name ||
          (result.names && result.names.length > 0
            ? String(result.names[0]?.name || "")
            : "");

        // Find a valid address (preferring Finnish ones)
        const primaryAddress = result.addresses?.find(
          (address) => !address.endDate
        );

        // Ensure businessId is a string
        let businessIdStr = "";
        if (typeof result.businessId === "string") {
          businessIdStr = result.businessId;
        } else if (result.businessId) {
          // Handle complex object
          try {
            if (typeof result.businessId === "object") {
              const bidObj = result.businessId as Record<
                string,
                string | number | object
              >;
              if (bidObj.value && typeof bidObj.value === "string") {
                businessIdStr = bidObj.value;
              } else if (bidObj.id && typeof bidObj.id === "string") {
                businessIdStr = bidObj.id;
              } else {
                // Create a unique ID using index as fallback
                businessIdStr = `company-${index}`;
              }
            } else {
              businessIdStr = String(result.businessId);
            }
          } catch (error) {
            businessIdStr = `company-${index}`;
            console.error("Error processing businessId:", error);
          }
        } else {
          businessIdStr = `company-${index}`;
        }

        // Ensure registration date is a string
        let registrationDateStr = "";
        if (typeof result.registrationDate === "string") {
          registrationDateStr = result.registrationDate;
        } else if (result.registrationDate) {
          // Handle complex object - inspect all possible fields
          const regDateObj = result.registrationDate as Record<
            string,
            string | number | object
          >;
          if (regDateObj.value && typeof regDateObj.value === "string") {
            registrationDateStr = regDateObj.value;
          } else if (
            regDateObj.registrationDate &&
            typeof regDateObj.registrationDate === "string"
          ) {
            registrationDateStr = regDateObj.registrationDate as string;
          } else {
            // Last resort - stringify the date (but omit circular refs)
            try {
              registrationDateStr = JSON.stringify(result.registrationDate);
              if (
                registrationDateStr === "{}" ||
                registrationDateStr.includes("[object Object]")
              ) {
                registrationDateStr = "";
              }
            } catch {
              registrationDateStr = "";
            }
          }
        }

        // Ensure company form is a string
        let companyFormStr = "";
        if (result.companyForms && result.companyForms.length > 0) {
          const form = result.companyForms[0];
          if (typeof form === "string") {
            companyFormStr = form;
          } else if (form && typeof form.name === "string") {
            companyFormStr = form.name;
          } else if (form) {
            try {
              companyFormStr = JSON.stringify(form);
            } catch {
              companyFormStr = "";
            }
          }
        }

        // Get location string
        const locationStr = primaryAddress
          ? `${primaryAddress.postCode || ""} ${
              primaryAddress.postOffices?.[0]?.city || ""
            }`.trim()
          : "";

        // Get end date
        const endDateStr = result.endDate || "";

        return {
          businessId: businessIdStr,
          name: String(primaryName),
          registrationDate: registrationDateStr,
          companyForm: companyFormStr,
          location: locationStr,
          endDate: endDateStr,
          detailsUri: `${BASE_URL}/companies/${businessIdStr}`,
        };
      } catch (error) {
        console.error("Error transforming company data:", error, result);
        // Return a safe default object
        return {
          businessId: `error-${index}`,
          name: "Error processing data",
          registrationDate: "",
          companyForm: "",
          location: "",
          endDate: "",
          detailsUri: "",
        };
      }
    }
  );

  return {
    results: companies,
    totalResults: data.totalResults || companies.length,
    currentPage: page,
    totalPages: Math.ceil((data.totalResults || companies.length) / maxResults),
  };
};

// Search companies
export const fetchCompanies = async (
  params: CompanySearchParams
): Promise<CompanySearchResponse> => {
  const searchParams = new URLSearchParams();

  // Add all formatted params to URLSearchParams
  Object.entries(formatSearchParams(params)).forEach(([key, value]) => {
    searchParams.append(key, value);
  });

  const url = `${BASE_URL}/companies?${searchParams.toString()}`;

  try {
    // Use the correct endpoint structure
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`PRH API error: ${response.status}`);
    }

    const data: PRHApiResponse = await response.json();

    // Let the API handle pagination
    return transformResponse(data, params.page || 0, 100);
  } catch (error) {
    console.error("Error searching companies:", error);
    return {
      results: [],
      totalResults: 0,
      currentPage: params.page || 0,
      totalPages: 0,
    };
  }
};
