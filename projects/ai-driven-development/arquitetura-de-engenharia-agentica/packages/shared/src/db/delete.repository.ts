export interface DeleteRepository<TId = string> {
  delete(id: TId): Promise<void>;
}
