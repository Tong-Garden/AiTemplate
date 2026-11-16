import { create } from 'zustand';
import { createStatusHelpers } from '@/core/store/status-helpers';
import {
  createCountryService,
  deleteCountryService,
  getCountriesService,
  getCountryByIdService,
  updateCountryService,
} from '../services';
import { DEFAULT_LIMIT } from '../schemas';
import type { CountryState, CountryStore } from './country.state';

/** Zustand store for countries: server-side pagination, error handling and status flags. */
export const useCountryStore = create<CountryStore>((set, get) => {
  const { flash, reportError } = createStatusHelpers<CountryState>(set);

  const run = async <T>(action: () => Promise<T>): Promise<T> => {
    set({ isLoading: true, error: null, errors: [], fieldErrors: {} });
    try {
      return await action();
    } catch (err) {
      reportError(err as Error);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  };

  const reload = async (): Promise<void> => {
    const { page, limit } = get().pagination;
    await get().fetchCountries(page, limit);
  };

  return {
    countries: [],
    selectedCountry: null,
    pagination: {
      page: 1,
      limit: DEFAULT_LIMIT,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    },
    isLoading: false,
    error: null,
    errors: [],
    fieldErrors: {},
    isSuccess: false,
    isUpdated: false,
    isDeleted: false,

    fetchCountries: async (page = 1, limit = DEFAULT_LIMIT) => {
      await run(async () => {
        const result = await getCountriesService(page, limit);
        set({ countries: result.data, pagination: result.meta });
      }).catch(() => undefined);
    },

    fetchCountryById: async (id) => {
      await run(async () => {
        set({ selectedCountry: await getCountryByIdService(id) });
      }).catch(() => undefined);
    },

    createCountry: async (formData) => {
      const created = await run(() => createCountryService(formData));
      flash('isSuccess');
      await reload();
      return created;
    },

    updateCountry: async (id, formData) => {
      const updated = await run(() => updateCountryService(id, formData));
      set((state) => ({
        countries: state.countries.map((item) => (item.id === id ? updated : item)),
        selectedCountry: state.selectedCountry?.id === id ? updated : state.selectedCountry,
      }));
      flash('isUpdated');
      return updated;
    },

    deleteCountry: async (id) => {
      await run(() => deleteCountryService(id));
      flash('isDeleted');
      const { page, limit } = get().pagination;
      const wasLastOnPage = get().countries.length === 1 && page > 1;
      await get().fetchCountries(wasLastOnPage ? page - 1 : page, limit);
    },

    goToPage: (page) => get().fetchCountries(page, get().pagination.limit),
    nextPage: () => get().fetchCountries(get().pagination.page + 1, get().pagination.limit),
    previousPage: () => get().fetchCountries(get().pagination.page - 1, get().pagination.limit),
    setLimit: (limit) => get().fetchCountries(1, limit),
  };
});
