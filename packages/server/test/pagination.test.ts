import { describe, expect, it } from 'vitest';
import {
  PAGE_SIZE_DEFAULT,
  PAGE_SIZE_MAX,
  paginated,
  paginationInput,
  paginationMeta,
  paginationOffset,
} from '../src/lib/pagination.js';

describe('paginationInput', () => {
  it('defaults to the strapi page/pageSize configuration', () => {
    expect(paginationInput.parse({})).toEqual({ page: 1, pageSize: PAGE_SIZE_DEFAULT });
    expect(PAGE_SIZE_DEFAULT).toBe(1000);
  });

  it('coerces the numbers the app sends as query strings', () => {
    expect(paginationInput.parse({ page: '3', pageSize: '20' })).toEqual({ page: 3, pageSize: 20 });
  });

  it('rejects a pageSize above the maximum and a page below one', () => {
    expect(paginationInput.safeParse({ pageSize: PAGE_SIZE_MAX + 1 }).success).toBe(false);
    expect(paginationInput.safeParse({ page: 0 }).success).toBe(false);
  });
});

describe('paginationOffset', () => {
  it('is zero based on the first page', () => {
    expect(paginationOffset({ page: 1, pageSize: 20 })).toBe(0);
    expect(paginationOffset({ page: 3, pageSize: 20 })).toBe(40);
  });
});

describe('paginationMeta', () => {
  it('rounds pageCount up', () => {
    expect(paginationMeta({ page: 1, pageSize: 20 }, 41).pagination.pageCount).toBe(3);
    expect(paginationMeta({ page: 1, pageSize: 20 }, 40).pagination.pageCount).toBe(2);
    expect(paginationMeta({ page: 1, pageSize: 20 }, 0).pagination.pageCount).toBe(0);
  });
});

describe('paginated', () => {
  it('produces the StrapiApiResponseList shape', () => {
    expect(paginated([{ documentId: 'a' }], { page: 2, pageSize: 20 }, 25)).toEqual({
      data: [{ documentId: 'a' }],
      meta: { pagination: { page: 2, pageSize: 20, pageCount: 2, total: 25 } },
    });
  });
});
