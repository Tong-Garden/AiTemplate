import { create } from 'zustand';
import { createStatusHelpers } from '@/core/store/status-helpers';
import {
  createCompanyService,
  deleteCompanyService,
  getCompaniesService,
  getCompanyByIdService,
  updateCompanyService,
} from '../services';
import { DEFAULT_LIMIT } from '../schemas';
import type { CompanyState, CompanyStore } from './company.state';

/** Zustand store for companies: server-side pagination, error handling and status flags. */
export const useCompanyStore = create<CompanyStore>((set, get) => {
  const { flash, reportError } = createStatusHelpers<CompanyState>(set);

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
    await get().fetchCompanies(page, limit);
  };

  return {
    companies: [],
    selectedCompany: null,
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

    fetchCompanies: async (page = 1, limit = DEFAULT_LIMIT) => {
      await run(async () => {
        const result = await getCompaniesService(page, limit);
        set({ companies: result.data, pagination: result.meta });
      }).catch(() => undefined);
    },

    fetchCompanyById: async (id) => {
      await run(async () => {
        set({ selectedCompany: await getCompanyByIdService(id) });
      }).catch(() => undefined);
    },

    createCompany: async (formData) => {
      const created = await run(() => createCompanyService(formData));
      flash('isSuccess');
      await reload();
      return created;
    },

    updateCompany: async (id, formData) => {
      const updated = await run(() => updateCompanyService(id, formData));
      set((state) => ({
        companies: state.companies.map((item) => (item.id === id ? updated : item)),
        selectedCompany: state.selectedCompany?.id === id ? updated : state.selectedCompany,
      }));
      flash('isUpdated');
      return updated;
    },

    deleteCompany: async (id) => {
      await run(() => deleteCompanyService(id));
      flash('isDeleted');
      const { page, limit } = get().pagination;
      const wasLastOnPage = get().companies.length === 1 && page > 1;
      await get().fetchCompanies(wasLastOnPage ? page - 1 : page, limit);
    },

    goToPage: (page) => get().fetchCompanies(page, get().pagination.limit),
    nextPage: () => get().fetchCompanies(get().pagination.page + 1, get().pagination.limit),
    previousPage: () => get().fetchCompanies(get().pagination.page - 1, get().pagination.limit),
    setLimit: (limit) => get().fetchCompanies(1, limit),
  };
});
