import { NotFoundError } from "@sdd/shared";
import { DeleteUser, User } from "../../../src";
import { FakeCryptoProvider, FakeUserRepository } from "../../mock";

async function makeUser(email: string, name = "Joao Silva") {
  return new User({
    name,
    email,
    password: await new FakeCryptoProvider().encrypt("Senha@12345"),
  });
}

describe("DeleteUser", () => {
  test("deve excluir o usuario quando ele existir, sem afetar os demais", async () => {
    const target = await makeUser("joao@silva.com");
    const other = await makeUser("maria@silva.com", "Maria Souza");
    const userRepository = new FakeUserRepository([target, other]);
    const useCase = new DeleteUser(userRepository);

    await expect(useCase.execute({ id: target.id })).resolves.toBeUndefined();

    await expect(userRepository.findById(target.id)).resolves.toBeNull();
    expect(userRepository.users).toEqual([other]);
  });

  test("deve rejeitar com 404 user.not_found quando o usuario nao existir", async () => {
    const other = await makeUser("maria@silva.com", "Maria Souza");
    const userRepository = new FakeUserRepository([other]);
    const useCase = new DeleteUser(userRepository);

    const error = await useCase
      .execute({ id: "123e4567-e89b-42d3-a456-426614174000" })
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(NotFoundError);
    expect((error as NotFoundError).statusCode).toBe(404);
    expect((error as NotFoundError).message).toBe("user.not_found");
    expect(userRepository.users).toEqual([other]);
  });
});
