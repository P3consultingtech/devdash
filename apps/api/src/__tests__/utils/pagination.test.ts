import { describe, it, expect } from 'vitest';
import { getPaginationParams, buildPaginatedResponse } from '../../utils/pagination';

describe('Pagination Utilities', () => {
  describe('getPaginationParams', () => {
    it('should return skip=0, take=10 for page 1, limit 10', () => {
      const result = getPaginationParams(1, 10);
      expect(result).toEqual({ skip: 0, take: 10 });
    });

    it('should return skip=10, take=10 for page 2, limit 10', () => {
      const result = getPaginationParams(2, 10);
      expect(result).toEqual({ skip: 10, take: 10 });
    });

    it('should return skip=20, take=10 for page 3, limit 10', () => {
      const result = getPaginationParams(3, 10);
      expect(result).toEqual({ skip: 20, take: 10 });
    });

    it('should handle limit of 1', () => {
      const result = getPaginationParams(5, 1);
      expect(result).toEqual({ skip: 4, take: 1 });
    });

    it('should handle large page numbers', () => {
      const result = getPaginationParams(1000, 25);
      expect(result).toEqual({ skip: 24975, take: 25 });
    });

    it('should handle large limit values', () => {
      const result = getPaginationParams(1, 100);
      expect(result).toEqual({ skip: 0, take: 100 });
    });

    it('should handle page 0 (edge case -- produces negative skip)', () => {
      const result = getPaginationParams(0, 10);
      // (0 - 1) * 10 = -10, this is a known edge case
      expect(result).toEqual({ skip: -10, take: 10 });
    });

    it('should handle negative page (edge case)', () => {
      const result = getPaginationParams(-1, 10);
      // (-1 - 1) * 10 = -20
      expect(result).toEqual({ skip: -20, take: 10 });
    });

    it('should handle limit of 0 (edge case)', () => {
      const result = getPaginationParams(1, 0);
      expect(result).toEqual({ skip: 0, take: 0 });
    });

    it('should handle negative limit (edge case)', () => {
      const result = getPaginationParams(1, -5);
      expect(result).toEqual({ skip: -0, take: -5 });
    });
  });

  describe('buildPaginatedResponse', () => {
    it('should build response for first page with data', () => {
      const data = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const result = buildPaginatedResponse(data, 30, 1, 10);
      expect(result).toEqual({
        data,
        pagination: {
          page: 1,
          limit: 10,
          total: 30,
          totalPages: 3,
        },
      });
    });

    it('should calculate totalPages correctly when total divides evenly by limit', () => {
      const result = buildPaginatedResponse([], 20, 1, 10);
      expect(result.pagination.totalPages).toBe(2);
    });

    it('should round up totalPages when total does not divide evenly by limit', () => {
      const result = buildPaginatedResponse([], 21, 1, 10);
      expect(result.pagination.totalPages).toBe(3);
    });

    it('should return totalPages=1 when total equals limit', () => {
      const result = buildPaginatedResponse([], 10, 1, 10);
      expect(result.pagination.totalPages).toBe(1);
    });

    it('should return totalPages=1 when total is less than limit', () => {
      const result = buildPaginatedResponse([], 5, 1, 10);
      expect(result.pagination.totalPages).toBe(1);
    });

    it('should return totalPages=0 when total is 0', () => {
      const result = buildPaginatedResponse([], 0, 1, 10);
      expect(result.pagination.totalPages).toBe(0);
    });

    it('should handle empty data array', () => {
      const result = buildPaginatedResponse([], 0, 1, 10);
      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });

    it('should preserve the exact data array passed in', () => {
      const data = [{ name: 'Alice' }, { name: 'Bob' }];
      const result = buildPaginatedResponse(data, 2, 1, 10);
      expect(result.data).toBe(data); // reference equality
    });

    it('should correctly reflect the provided page and limit values', () => {
      const result = buildPaginatedResponse(['a', 'b'], 50, 3, 20);
      expect(result.pagination.page).toBe(3);
      expect(result.pagination.limit).toBe(20);
      expect(result.pagination.total).toBe(50);
      expect(result.pagination.totalPages).toBe(3);
    });

    it('should handle totalPages with limit of 1', () => {
      const result = buildPaginatedResponse(['item'], 100, 1, 1);
      expect(result.pagination.totalPages).toBe(100);
    });

    it('should handle Infinity for totalPages when limit is 0 (edge case)', () => {
      const result = buildPaginatedResponse([], 10, 1, 0);
      // Math.ceil(10 / 0) = Infinity
      expect(result.pagination.totalPages).toBe(Infinity);
    });
  });
});
