export function getPaginationParams(page: number, limit: number) {
  return {
    skip: (page - 1) * limit,
    take: limit,
  };
}

export function buildPaginatedResponse<T>(data: T[], total: number, page: number, limit: number) {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
