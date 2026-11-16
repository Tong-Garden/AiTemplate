import type { AxiosResponse } from 'axios';

/** Pagination block the backend returns in `meta` for every list endpoint. */
export type PaginationMetaDto = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

/** One page of results together with its pagination meta. */
export type PaginatedResult<T> = {
  data: T;
  meta: PaginationMetaDto;
};

/** Axios response that also carries the envelope's `meta`, attached by the response interceptor. */
export type MetaResponse<T> = AxiosResponse<T> & { meta?: PaginationMetaDto };
