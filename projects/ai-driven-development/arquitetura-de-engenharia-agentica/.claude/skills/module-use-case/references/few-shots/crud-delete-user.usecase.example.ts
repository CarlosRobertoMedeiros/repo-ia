import { UseCase } from "@<scope>/shared";
import { UserRepository } from "../provider";

export interface DeleteUserIn {
  id: string;
}

export class DeleteUser implements UseCase<DeleteUserIn, void> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: DeleteUserIn): Promise<void> {
    await this.userRepository.delete(input.id);
  }
}
