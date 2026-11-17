import { CreateRepository } from "./create.repository";
import { DeleteRepository } from "./delete.repository";
import { FindByIdRepository } from "./find-by-id.repository";
import { FindPageRepository } from "./find-page.repository";
import { UpdateRepository } from "./update.repository";

export interface CrudRepository<
  TCreateData,
  TUpdateData,
  TEntity,
  TPageParams,
  TId = string,
>
  extends
    CreateRepository<TCreateData, TEntity>,
    UpdateRepository<TUpdateData, TEntity>,
    DeleteRepository<TId>,
    FindByIdRepository<TEntity, TId>,
    FindPageRepository<TPageParams, TEntity> {}
