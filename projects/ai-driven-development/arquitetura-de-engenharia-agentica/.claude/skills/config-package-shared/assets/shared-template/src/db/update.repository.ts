export interface UpdateRepository<TUpdateData, TEntity = TUpdateData> {
  update(data: TUpdateData): Promise<TEntity>;
}
