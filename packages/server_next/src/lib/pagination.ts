import { z } from 'zod';

/**
 * Pagination contract of the strapi backend (`config/api.ts`: defaultLimit/maxLimit 1000,
 * withCount true), so `StrapiApiResponseList<T>` consumers in the app keep working.
 */
export const PAGE_SIZE_DEFAULT = 1000;
export const PAGE_SIZE_MAX = 1000;

export const paginationInput = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(PAGE_SIZE_MAX).default(PAGE_SIZE_DEFAULT),
});

export type PaginationInput = z.infer<typeof paginationInput>;

export interface PaginationMeta {
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export const paginationOffset = ({ page, pageSize }: PaginationInput): number => (page - 1) * pageSize;

export const paginationMeta = (pagination: PaginationInput, total: number): PaginationMeta => ({
  pagination: {
    page: pagination.page,
    pageSize: pagination.pageSize,
    pageCount: pagination.pageSize > 0 ? Math.ceil(total / pagination.pageSize) : 0,
    total,
  },
});

export const paginated = <T>(data: T[], pagination: PaginationInput, total: number): PaginatedResult<T> => ({
  data,
  meta: paginationMeta(pagination, total),
});
