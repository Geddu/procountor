import { useQuery } from "@tanstack/react-query";
import { CompanySearchParams, CompanySearchResponse } from "../types";
import { fetchCompanies } from "../api/prhApi";

export const useCompanies = (params: CompanySearchParams) => {
  const result = useQuery<CompanySearchResponse, Error>({
    queryKey: ["companies", params],
    queryFn: () => fetchCompanies(params),
    enabled: true,
    staleTime: 5 * 60 * 1000, // Keep data fresh for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch when window gets focus
    refetchOnMount: false, // Use cached data when available
  });

  return result;
};
