export type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // page index (0-based)
  size: number;
};