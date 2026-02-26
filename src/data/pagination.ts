export const PAGINATION = {
  postsPerPage: 10,
  taxonomyPerPage: 20,
} as const;

export type PaginationResult<T> = {
  items: T[];
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
};

const clampInt = (value: number, min: number, max: number): number => {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.trunc(value)));
};

export const parsePageParam = (value: string | undefined): number => {
  if (!value) return 1;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return parsed;
};

export const getTotalPages = (totalItems: number, perPage: number): number =>
  Math.max(1, Math.ceil(Math.max(0, totalItems) / perPage));

export const paginate = <T,>(
  items: readonly T[],
  options: { page: number; perPage: number },
): PaginationResult<T> => {
  const totalItems = items.length;
  const totalPages = getTotalPages(totalItems, options.perPage);
  const page = clampInt(options.page, 1, totalPages);
  const startIndex = (page - 1) * options.perPage;
  const endIndex = startIndex + options.perPage;
  const slice = items.slice(startIndex, endIndex);
  return {
    items: slice,
    page,
    perPage: options.perPage,
    totalItems,
    totalPages,
    hasPrev: page > 1,
    hasNext: page < totalPages,
  };
};
