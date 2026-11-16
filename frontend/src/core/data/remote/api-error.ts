import { ZodError } from 'zod';

/** Structured error object from the backend envelope's `errors` array. */
export type ApiError = {
  type: string;
  title: string;
  status: number;
  detail: string;
  field?: string;
};

type RawApiError = Partial<Record<keyof ApiError, string | number | null>>;

/**
 * Error that keeps the backend's structured `errors` so stores can show per-field messages.
 */
export class ApiRequestError extends Error {
  readonly errors: ApiError[];

  constructor(errors: ApiError[]) {
    super(errors.map((item) => item.detail).join('; '));
    this.name = 'ApiRequestError';
    this.errors = errors;
  }
}

/**
 * Reads the `errors` array from a response body.
 *
 * @param body - Parsed JSON body of a failed response.
 * @returns Normalised errors; empty when the body does not follow the envelope.
 */
export const extractApiErrors = (body?: { errors?: RawApiError[] } | null): ApiError[] =>
  (body?.errors ?? []).map((item) => ({
    type: String(item.type ?? 'error'),
    title: String(item.title ?? 'Error'),
    status: Number(item.status ?? 0),
    detail: String(item.detail ?? 'Request failed'),
    field: item.field ? String(item.field) : undefined,
  }));

const fromZod = (err: ZodError): ApiError[] =>
  err.issues.map((issue) => ({
    type: 'validation-error',
    title: 'Validation Error',
    status: 422,
    detail: issue.message,
    field: issue.path.length ? String(issue.path[0]) : undefined,
  }));

/**
 * Converts anything thrown by a service or the API client into `ApiError[]`.
 *
 * @param err - The caught value.
 * @returns The structured errors; never raw error objects or stack traces.
 */
export const parseApiError = (err: Error | ZodError | object | string): { errors: ApiError[] } => {
  if (err instanceof ApiRequestError) return { errors: err.errors };
  if (err instanceof ZodError) return { errors: fromZod(err) };
  const detail = err instanceof Error ? err.message : 'Something went wrong';
  return { errors: [{ type: 'error', title: 'Error', status: 0, detail }] };
};
