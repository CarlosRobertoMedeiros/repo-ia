import { PageResult } from "./page-result";

export interface FindPageRepository<TPageParams, TItem> {
  findPage(params: TPageParams): Promise<PageResult<TItem>>;
}
