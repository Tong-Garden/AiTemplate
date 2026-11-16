import type { ApiError } from '@/core/data/remote/api-error';
import type { PaginationMetaDto } from '@/core/data/remote/api-types';
import type { CountryDto } from '../dtos';
import type { CreateCountryFormData, UpdateCountryFormData } from '../schemas';

/** Data and status flags held by the country store. */
export type CountryState = {
  countries: CountryDto[];
  selectedCountry: CountryDto | null;
  pagination: PaginationMetaDto;
  isLoading: boolean;
  error: string | null;
  errors: ApiError[];
  fieldErrors: Record<string, string>;
  isSuccess: boolean;
  isUpdated: boolean;
  isDeleted: boolean;
};

/** Country store: state plus the actions that change it. */
export type CountryStore = CountryState & {
  fetchCountries: (page?: number, limit?: number) => Promise<void>;
  fetchCountryById: (id: string) => Promise<void>;
  createCountry: (formData: CreateCountryFormData) => Promise<CountryDto>;
  updateCountry: (id: string, formData: UpdateCountryFormData) => Promise<CountryDto>;
  deleteCountry: (id: string) => Promise<void>;
  goToPage: (page: number) => Promise<void>;
  nextPage: () => Promise<void>;
  previousPage: () => Promise<void>;
  setLimit: (limit: number) => Promise<void>;
};
