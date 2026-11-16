import { parseApiError } from '@/core/data/remote/api-error';
import type { ApiError } from '@/core/data/remote/api-error';

const CLEAR_MS = 5000;

/** Status fields every list store keeps next to its data. */
export type StatusState = {
  error: string | null;
  errors: ApiError[];
  fieldErrors: Record<string, string>;
  isSuccess: boolean;
  isUpdated: boolean;
  isDeleted: boolean;
};

type FlagKey = 'isSuccess' | 'isUpdated' | 'isDeleted';

/** Helpers a store uses to publish success flags and errors that clear themselves. */
export type StatusHelpers = {
  flash: (key: FlagKey) => void;
  reportError: (err: Error | object | string) => void;
};

/**
 * Builds the success-flag and error helpers for one store.
 *
 * Each flag and the error block keep a single timer, so a newer message is never cleared by
 * an older timer.
 *
 * @param set - The store's partial `set`.
 * @returns `flash` to raise a success flag for five seconds and `reportError` to store a
 * parsed error with its per-field map for five seconds.
 */
export const createStatusHelpers = <S extends StatusState>(
  set: (partial: Partial<S>) => void,
): StatusHelpers => {
  const timers = new Map<string, ReturnType<typeof setTimeout>>();

  const scheduleClear = (id: string, clear: () => void): void => {
    clearTimeout(timers.get(id));
    timers.set(id, setTimeout(clear, CLEAR_MS));
  };

  const flash = (key: FlagKey): void => {
    set({ [key]: true } as Partial<S>);
    scheduleClear(key, () => set({ [key]: false } as Partial<S>));
  };

  const reportError = (err: Error | object | string): void => {
    const { errors } = parseApiError(err);
    const fieldErrors = Object.fromEntries(
      errors.flatMap((item) => (item.field ? [[item.field, item.detail]] : [])),
    );
    set({ error: errors.map((item) => item.detail).join('; '), errors, fieldErrors } as Partial<S>);
    const cleared: Partial<StatusState> = { error: null, errors: [], fieldErrors: {} };
    scheduleClear('error', () => set(cleared as Partial<S>));
  };

  return { flash, reportError };
};
