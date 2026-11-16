import type { ApiError } from '@/core/data/remote/api-error';
import type { PaginationMetaDto } from '@/core/data/remote/api-types';
import type { CompanyDto } from '../dtos';
import type { CreateCompanyFormData, UpdateCompanyFormData } from '../schemas';

/** Data and status flags held by the company store. */
export type CompanyState = {
  companies: CompanyDto[];
  selectedCompany: CompanyDto | null;
  pagination: PaginationMetaDto;
  isLoading: boolean;
  error: string | null;
  errors: ApiError[];
  fieldErrors: Record<string, string>;
  isSuccess: boolean;
  isUpdated: boolean;
  isDeleted: boolean;
};

/** Company store: state plus the actions that change it. */
export type CompanyStore = CompanyState & {
  fetchCompanies: (page?: number, limit?: number) => Promise<void>;
  fetchCompanyById: (id: string) => Promise<void>;
  createCompany: (formData: CreateCompanyFormData) => Promise<CompanyDto>;
  updateCompany: (id: string, formData: UpdateCompanyFormData) => Promise<CompanyDto>;
  deleteCompany: (id: string) => Promise<void>;
  goToPage: (page: number) => Promise<void>;
  nextPage: () => Promise<void>;
  previousPage: () => Promise<void>;
  setLimit: (limit: number) => Promise<void>;
};
