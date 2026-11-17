import { NotFoundError, UseCase } from "@sdd/shared";
import { UserRepository } from "../provider";

export interface DeleteUserIn {
  id: string;
}

export class DeleteUser implements UseCase<DeleteUserIn, void> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: DeleteUserIn): Promise<void> {
    const user = await this.userRepository.findById(input.id);

    if (!user) {
      throw new NotFoundError("user.not_found");
    }

    await this.userRepository.delete(input.id);
  }
}
