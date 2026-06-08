import { describe, it, expect } from 'vitest';
import {
  parsePageParam,
  getTotalPages,
  paginate,
  PAGINATION,
} from '../data/pagination';

describe('PAGINATION constants', () => {
  it('should export postsPerPage as 10', () => {
    expect(PAGINATION.postsPerPage).toBe(10);
  });

  it('should export taxonomyPerPage as 20', () => {
    expect(PAGINATION.taxonomyPerPage).toBe(20);
  });
});

describe('parsePageParam', () => {
  it('should return the parsed integer for valid positive page', () => {
    expect(parsePageParam('3')).toBe(3);
    expect(parsePageParam('10')).toBe(10);
    expect(parsePageParam('100')).toBe(100);
  });

  it('should return 1 for undefined input', () => {
    expect(parsePageParam(undefined)).toBe(1);
  });

  it('should return 1 for non-numeric strings', () => {
    expect(parsePageParam('abc')).toBe(1);
    expect(parsePageParam('hello')).toBe(1);
    expect(parsePageParam('')).toBe(1);
  });

  it('should return 1 for negative numbers', () => {
    expect(parsePageParam('-1')).toBe(1);
    expect(parsePageParam('-100')).toBe(1);
  });

  it('should return 1 for zero', () => {
    expect(parsePageParam('0')).toBe(1);
  });

  it('should return 1 for NaN', () => {
    expect(parsePageParam('not-a-number')).toBe(1);
  });
});

describe('getTotalPages', () => {
  it('should return 3 for 25 items with 10 per page', () => {
    expect(getTotalPages(25, 10)).toBe(3);
  });

  it('should return 1 for 0 items', () => {
    expect(getTotalPages(0, 10)).toBe(1);
  });

  it('should return 1 for items less than perPage', () => {
    expect(getTotalPages(5, 10)).toBe(1);
  });

  it('should return 2 for exactly 20 items with 10 per page', () => {
    expect(getTotalPages(20, 10)).toBe(2);
  });

  it('should handle large numbers correctly', () => {
    expect(getTotalPages(100, 10)).toBe(10);
    expect(getTotalPages(101, 10)).toBe(11);
  });
});

describe('paginate', () => {
  const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  it('should slice first page correctly with perPage 2', () => {
    const result = paginate(items, { page: 1, perPage: 2 });
    expect(result.items).toEqual([1, 2]);
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(5);
    expect(result.hasPrev).toBe(false);
    expect(result.hasNext).toBe(true);
  });

  it('should slice second page correctly', () => {
    const result = paginate(items, { page: 2, perPage: 2 });
    expect(result.items).toEqual([3, 4]);
    expect(result.page).toBe(2);
  });

  it('should slice last page correctly', () => {
    const result = paginate(items, { page: 5, perPage: 2 });
    expect(result.items).toEqual([9, 10]);
    expect(result.page).toBe(5);
    expect(result.hasPrev).toBe(true);
    expect(result.hasNext).toBe(false);
  });

  it('should clamp page to last page when out of bounds', () => {
    const result = paginate(items, { page: 99, perPage: 2 });
    expect(result.page).toBe(5); // clamped to last page
    expect(result.items).toEqual([9, 10]);
  });

  it('should clamp page to 1 when less than 1', () => {
    const result = paginate(items, { page: -5, perPage: 2 });
    expect(result.page).toBe(1);
    expect(result.items).toEqual([1, 2]);
  });

  it('should handle empty array', () => {
    const result = paginate([], { page: 1, perPage: 10 });
    expect(result.items).toEqual([]);
    expect(result.totalPages).toBe(1);
    expect(result.page).toBe(1);
    expect(result.hasPrev).toBe(false);
    expect(result.hasNext).toBe(false);
  });

  it('should include all metadata fields in result', () => {
    const result = paginate(items, { page: 1, perPage: 10 });
    expect(result).toHaveProperty('items');
    expect(result).toHaveProperty('page');
    expect(result).toHaveProperty('perPage');
    expect(result).toHaveProperty('totalItems');
    expect(result).toHaveProperty('totalPages');
    expect(result).toHaveProperty('hasPrev');
    expect(result).toHaveProperty('hasNext');
  });

  it('should set totalItems correctly', () => {
    const result = paginate(items, { page: 1, perPage: 2 });
    expect(result.totalItems).toBe(10);
  });
});
