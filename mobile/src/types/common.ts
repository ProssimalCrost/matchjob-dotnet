export interface PagedResult<T> {
  Data: T[];
  Total: number;
  Page: number;
  PageSize: number;
  TotalPages: number;
}
