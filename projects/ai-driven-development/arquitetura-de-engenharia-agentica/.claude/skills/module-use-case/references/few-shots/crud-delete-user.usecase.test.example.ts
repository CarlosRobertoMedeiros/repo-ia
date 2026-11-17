import { User } from "../../../src";
import { DeleteUser } from "../../../src/user/usecase/delete-user.usecase";
import { FakeUserRepository } from "../../mock";

describe("DeleteUser", () => {
  test("deve excluir a entidade quando ela existir", async () => {
    const user = new User({
      name: "Joao Silva",
      email: "joao@silva.com",
      password: "$2b$10$abcdefghijklmnopqrstuv1234567890abcdefghijklmnopqrs",
    });
    const userRepository = new FakeUserRepository([user]);
    const useCase = new DeleteUser(userRepository);

    await expect(useCase.execute({ id: user.id })).resolves.toBeUndefined();
    await expect(userRepository.findById(user.id)).resolves.toBeNull();
  });

  test("deve continuar previsivel mesmo quando o id nao existir", async () => {
    const userRepository = new FakeUserRepository();
    const useCase = new DeleteUser(userRepository);

    await expect(useCase.execute({ id: "missing-id" })).resolves.toBeUndefined();
    expect(userRepository.users).toEqual([]);
  });
}
