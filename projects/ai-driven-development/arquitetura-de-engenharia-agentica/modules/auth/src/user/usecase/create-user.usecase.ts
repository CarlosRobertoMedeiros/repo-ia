import { UseCase } from "@sdd/shared";
import { User } from "../model";
import { UserRepository } from "../provider";

export interface CreateUserIn {
  entity: User;
}

export class CreateUser
  implements UseCase<CreateUserIn, User>
{
  constructor(
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: CreateUserIn): Promise<User> {
    // Exemplo minimo para deixar a estrutura pronta para evolucao manual.
    return this.userRepository.create(input.entity);
  }
}
