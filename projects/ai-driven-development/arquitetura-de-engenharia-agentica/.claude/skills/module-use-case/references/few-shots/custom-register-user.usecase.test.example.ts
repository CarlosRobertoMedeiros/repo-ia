import { ValidationException } from "@<scope>/shared";
import { RegisterUser, User } from "../../../src";
import { FakeCryptoProvider, FakeUserRepository } from "../../mock";

describe("RegisterUser", () => {
  test("deve validar, transformar dependencias e persistir no caminho feliz", async () => {
    const cryptoProvider = new FakeCryptoProvider();
    const userRepository = new FakeUserRepository();
    const validateSpy = jest.spyOn(User.prototype, "validate");
    const useCase = new RegisterUser(cryptoProvider, userRepository);

    await expect(
      useCase.execute({
        name: "Joao Silva",
        email: "joao@silva.com",
        password: "Strong@123",
      }),
    ).resolves.toBeUndefined();

    expect(cryptoProvider.encryptedPasswords).toEqual(["Strong@123"]);
    expect(validateSpy).toHaveBeenCalledTimes(1);
    expect(userRepository.createdUsers).toHaveLength(1);

    validateSpy.mockRestore();
  });

  test("deve interromper o fluxo antes do efeito colateral quando a validacao falhar", async () => {
    const cryptoProvider = new FakeCryptoProvider();
    const userRepository = new FakeUserRepository();
    const useCase = new RegisterUser(cryptoProvider, userRepository);

    await expect(
      useCase.execute({
        name: "Joao Silva",
        email: "joao@silva.com",
        password: "123456",
      }),
    ).rejects.toThrow(ValidationException);

    expect(cryptoProvider.encryptedPasswords).toEqual([]);
    expect(userRepository.createdUsers).toEqual([]);
  });
}
