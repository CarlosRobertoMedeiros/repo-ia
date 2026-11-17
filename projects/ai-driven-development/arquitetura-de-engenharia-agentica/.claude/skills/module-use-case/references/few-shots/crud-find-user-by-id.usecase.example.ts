import { UseCase } from "@<scope>/shared";
import { User } from "../model";
import { UserRepository } from "../provider";

export interface FindUserByIdIn {
  id: string;
}

export interface FindUserByIdOut {
  user: User | null;
}

export class FindUserById implements UseCase<FindUserByIdIn, FindUserByIdOut> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: FindUserByIdIn): Promise<FindUserByIdOut> {
    const user = await this.userRepository.findById(input.id);

    return {
      user,
    };
  }
}
