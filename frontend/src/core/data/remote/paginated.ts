import { api } from './api';
import type { MetaResponse, PaginatedResult } from './api-types';

/**
 * GET a paginated list and return its data together with the envelope's pagination meta.
 *
 * @param url - List endpoint.
 * @param params - `page` and `limit` query parameters.
 * @returns The page of items and its meta.
 * @throws Error when the response carries no pagination meta.
 */
export const getPaginated = async <T>(
  url: string,
  params: { page: number; limit: number },
): Promise<PaginatedResult<T>> => {
  const response: MetaResponse<T> = await api.get<T>(url, { params });
  if (!response.meta) throw new Error('Response is missing pagination meta');
  return { data: response.data, meta: response.meta };
};
