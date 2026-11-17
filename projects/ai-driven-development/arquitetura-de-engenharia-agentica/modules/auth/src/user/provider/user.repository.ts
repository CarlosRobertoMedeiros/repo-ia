import { CrudRepository } from "@sdd/shared";
import { User } from "../model";

export interface UserPageParams {
  page: number;
  perPage: number;
}

export interface UserRepository extends CrudRepository<
  User,
  User,
  User,
  UserPageParams
> {
  findByEmail(email: string): Promise<User | null>;
}
