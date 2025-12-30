export type Page<T> = {
  content: T[];
  pageable: {
    pageNumber: number; // page index (0-based)
    pageSize: number;
  },
  total: number
};