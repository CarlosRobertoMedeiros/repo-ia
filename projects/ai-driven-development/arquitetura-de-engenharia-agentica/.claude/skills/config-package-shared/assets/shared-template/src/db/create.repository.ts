export interface CreateRepository<TCreateData, TEntity = TCreateData> {
  create(data: TCreateData): Promise<TEntity>;
}
