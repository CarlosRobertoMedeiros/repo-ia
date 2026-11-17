import { User } from "../../../src";
import { FindUserById } from "../../../src/user/usecase/find-user-by-id.usecase";
import { FakeUserRepository } from "../../mock";

describe("FindUserById", () => {
  test("deve devolver a entidade encontrada", async () => {
    const user = new User({
      name: "Joao Silva",
      email: "joao@silva.com",
      password: "$2b$10$abcdefghijklmnopqrstuv1234567890abcdefghijklmnopqrs",
    });
    const userRepository = new FakeUserRepository([user]);
    const useCase = new FindUserById(userRepository);

    await expect(useCase.execute({ id: user.id })).resolves.toEqual({
      user,
    });
  });

  test("deve devolver null quando a entidade nao existir", async () => {
    const userRepository = new FakeUserRepository();
    const useCase = new FindUserById(userRepository);

    await expect(useCase.execute({ id: "missing-id" })).resolves.toEqual({
      user: null,
    });
  });
}
