import { create } from 'zustand';
import { createStatusHelpers } from '@/core/store/status-helpers';
import {
  createUserService,
  deleteUserService,
  getUserByIdService,
  getUsersService,
  updateUserService,
  uploadUsersService,
} from '../services';
import { DEFAULT_LIMIT } from '../schemas';
import type { UserState, UserStore } from './user.state';

/** Zustand store for users: server-side pagination, error handling and status flags. */
export const useUserStore = create<UserStore>((set, get) => {
  const { flash, reportError } = createStatusHelpers<UserState>(set);

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
    await get().fetchUsers(page, limit);
  };

  return {
    users: [],
    selectedUser: null,
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

    fetchUsers: async (page = 1, limit = DEFAULT_LIMIT) => {
      await run(async () => {
        const result = await getUsersService(page, limit);
        set({ users: result.data, pagination: result.meta });
      }).catch(() => undefined);
    },

    fetchUserById: async (id) => {
      await run(async () => {
        set({ selectedUser: await getUserByIdService(id) });
      }).catch(() => undefined);
    },

    createUser: async (formData) => {
      const created = await run(() => createUserService(formData));
      flash('isSuccess');
      await reload();
      return created;
    },

    updateUser: async (id, formData) => {
      const updated = await run(() => updateUserService(id, formData));
      set((state) => ({
        users: state.users.map((item) => (item.id === id ? updated : item)),
        selectedUser: state.selectedUser?.id === id ? updated : state.selectedUser,
      }));
      flash('isUpdated');
      return updated;
    },

    deleteUser: async (id) => {
      await run(() => deleteUserService(id));
      flash('isDeleted');
      const { page, limit } = get().pagination;
      const wasLastOnPage = get().users.length === 1 && page > 1;
      await get().fetchUsers(wasLastOnPage ? page - 1 : page, limit);
    },

    uploadUsers: async (file) => {
      const result = await run(() => uploadUsersService(file));
      await reload();
      return result;
    },

    goToPage: (page) => get().fetchUsers(page, get().pagination.limit),
    nextPage: () => get().fetchUsers(get().pagination.page + 1, get().pagination.limit),
    previousPage: () => get().fetchUsers(get().pagination.page - 1, get().pagination.limit),
    setLimit: (limit) => get().fetchUsers(1, limit),
  };
});
