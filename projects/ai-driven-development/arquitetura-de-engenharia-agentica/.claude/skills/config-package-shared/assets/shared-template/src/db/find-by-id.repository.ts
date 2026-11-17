export interface FindByIdRepository<TEntity, TId = string> {
  findById(id: TId): Promise<TEntity | null>;
}
