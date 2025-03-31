export interface CompanySearchParams {
  location?: string;
  businessId?: string;
  registrationDateStart?: string;
  registrationDateEnd?: string;
  page?: number;
  maxResults?: number;
}

export interface Company {
  businessId: string;
  name: string;
  registrationDate: string;
  endDate?: string;
  companyForm?: string;
  location?: string;
  detailsUri?: string;
}

export interface CompanySearchResponse {
  results: Company[];
  totalResults: number;
  currentPage: number;
  totalPages: number;
}
