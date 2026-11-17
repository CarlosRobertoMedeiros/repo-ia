import { CrudRepository } from "@sdd/shared";
import { Product } from "../model";

export interface ProductPageParams {
  page: number;
  perPage: number;
}

export interface ProductRepository extends CrudRepository<
  Product,
  Product,
  Product,
  ProductPageParams
> {}
