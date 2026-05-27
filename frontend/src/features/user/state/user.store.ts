import { create } from 'zustand';
import {
  createUserService,
  deleteUserService,
  getUserByIdService,
  getUsersService,
  updateUserService,
  uploadUsersService,
} from '../services';
import type { UserStore } from './user.state';
import { CreateUserFormData, UpdateUserFormData } from '../schemas';

export const useUserStore = create<UserStore>((set, get) => {
  return {
    users: [],
    selectedUser: null,
    isLoading: false,
    error: null,
    isSuccess: false,
    isUpdated: false,
    isDeleted: false,
    isUploaded: false,

    fetchUsers: async () => {
      set({ isLoading: true, error: null });
      try {
        const data = await getUsersService();
        set({ users: data });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch users';
        set({ error: message });
        get().clearError();
      } finally {
        set({ isLoading: false });
      }
    },

    fetchUserById: async (id: string) => {
      set({ isLoading: true, error: null });
      try {
        const data = await getUserByIdService(id);
        set({ selectedUser: data });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch user';
        set({ error: message });
        get().clearError();
      } finally {
        set({ isLoading: false });
      }
    },

    createUser: async (formData: CreateUserFormData) => {
      set({ isLoading: true, error: null });
      try {
        const newUser = await createUserService(formData);
        set((state) => ({ users: [...state.users, newUser], isSuccess: true }));
        // Auto-clear success flags after 5 seconds
        setTimeout(() => {
          set({
            isSuccess: false,
          });
        }, 5000);
        return newUser;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create user';
        set({ error: message });
        get().clearError();
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    updateUser: async (id: string, formData: UpdateUserFormData) => {
      set({ isLoading: true, error: null });
      try {
        const updatedUser = await updateUserService(id, formData);
        set((state) => ({
          users: state.users.map((user) => (user.id === id ? updatedUser : user)),
          selectedUser: state.selectedUser?.id === id ? updatedUser : state.selectedUser,
          isUpdated: true,
        }));
        // Auto-clear success flags after 5 seconds
        setTimeout(() => {
          set({
            isUpdated: false,
          });
        }, 5000);
        return updatedUser;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update user';
        set({ error: message });
        get().clearError();
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    deleteUser: async (id: string) => {
      set({ isLoading: true, error: null });
      try {
        await deleteUserService(id);
        set((state) => ({
          users: state.users.filter((user) => user.id !== id),
          selectedUser: state.selectedUser?.id === id ? null : state.selectedUser,
          isDeleted: true,
        }));
        // Auto-clear success flags after 5 seconds
        setTimeout(() => {
          set({
            isDeleted: false,
          });
        }, 5000);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete user';
        set({ error: message });
        get().clearError();
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    uploadUsers: async (file: File) => {
      set({ isLoading: true, error: null });
      try {
        const result = await uploadUsersService(file);
        const updatedUsers = await getUsersService();
        set({ users: updatedUsers, isUploaded: true });
        // Auto-clear success flags after 5 seconds
        setTimeout(() => {
          set({
            isUploaded: false,
          });
        }, 5000);
        return result;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to upload users';
        set({ error: message });
        get().clearError();
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },
    clearError: () => {
      setTimeout(() => {
        set({ error: null });
      }, 5000);
    },
  };
});
