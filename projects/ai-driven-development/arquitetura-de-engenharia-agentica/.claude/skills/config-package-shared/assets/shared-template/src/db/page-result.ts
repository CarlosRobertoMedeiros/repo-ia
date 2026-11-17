export interface PageResult<TItem> {
  items: TItem[];
  page: number;
  perPage: number;
  total: number;
}
