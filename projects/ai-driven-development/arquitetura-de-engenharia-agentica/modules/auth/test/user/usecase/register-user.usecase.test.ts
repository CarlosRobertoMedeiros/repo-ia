import { DomainError, ValidationException } from "@sdd/shared";
import { RegisterUser, RegisterUserIn, User } from "../../../src";
import {
  FAKE_HASH_PREFIX,
  FakeCryptoProvider,
  FakeUserRepository,
} from "../../mock";

const VALID_INPUT: RegisterUserIn = {
  name: "Joao Silva",
  email: "joao@silva.com",
  password: "Strong@123",
};

function makeSut(initialUsers: User[] = []) {
  const cryptoProvider = new FakeCryptoProvider();
  const userRepository = new FakeUserRepository(initialUsers);
  const useCase = new RegisterUser(cryptoProvider, userRepository);

  return { cryptoProvider, userRepository, useCase };
}

describe("RegisterUser", () => {
  test("deve validar, criptografar a senha e persistir no caminho feliz", async () => {
    const { cryptoProvider, userRepository, useCase } = makeSut();
    const validateSpy = jest.spyOn(User.prototype, "validate");

    await expect(useCase.execute(VALID_INPUT)).resolves.toBeUndefined();

    expect(cryptoProvider.encryptedPasswords).toEqual(["Strong@123"]);
    expect(validateSpy).toHaveBeenCalledTimes(1);
    expect(userRepository.users).toHaveLength(1);

    const [user] = userRepository.users;
    expect(user!.name).toBe("Joao Silva");
    expect(user!.email).toBe("joao@silva.com");
    expect(user!.password.startsWith(FAKE_HASH_PREFIX)).toBe(true);
    expect(user!.password).not.toBe(VALID_INPUT.password);

    validateSpy.mockRestore();
  });

  test("deve normalizar nome e e-mail antes de persistir", async () => {
    const { userRepository, useCase } = makeSut();

    await useCase.execute({
      ...VALID_INPUT,
      name: " Joao Silva ",
      email: "JOAO@Silva.com",
    });

    expect(userRepository.users[0]!.name).toBe("Joao Silva");
    expect(userRepository.users[0]!.email).toBe("joao@silva.com");
  });

  test.each([
    ["name", { name: "" }, "user.name.required"],
    ["name", { name: "Joao" }, "user.name.person.name"],
    ["email", { email: "invalido" }, "user.email.invalid.email"],
    ["password", { password: "123456" }, "user.password.strong.password"],
    ["password", { password: "" }, "user.password.required"],
  ])(
    "deve interromper o fluxo antes de qualquer efeito colateral quando %s for invalido",
    async (_field, override, expectedMessage) => {
      const { cryptoProvider, userRepository, useCase } = makeSut();

      const error = await useCase
        .execute({ ...VALID_INPUT, ...override })
        .catch((e: unknown) => e);

      expect(error).toBeInstanceOf(ValidationException);
      expect(
        (error as ValidationException).errors.map((item) => item.message),
      ).toContain(expectedMessage);
      expect(cryptoProvider.encryptedPasswords).toEqual([]);
      expect(userRepository.users).toEqual([]);
    },
  );

  test("deve rejeitar com 409 quando o e-mail ja estiver cadastrado", async () => {
    const existing = new User({
      name: "Maria Souza",
      email: "joao@silva.com",
      password: `${FAKE_HASH_PREFIX}${"a".repeat(53)}`,
    });
    const { cryptoProvider, userRepository, useCase } = makeSut([existing]);

    const error = await useCase.execute(VALID_INPUT).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(DomainError);
    expect((error as DomainError).statusCode).toBe(409);
    expect((error as DomainError).message).toBe("user.email.already.registered");
    expect(cryptoProvider.encryptedPasswords).toEqual([]);
    expect(userRepository.users).toEqual([existing]);
  });

  test("deve detectar e-mail duplicado ignorando maiusculas", async () => {
    const existing = new User({
      name: "Maria Souza",
      email: "joao@silva.com",
      password: `${FAKE_HASH_PREFIX}${"a".repeat(53)}`,
    });
    const { useCase } = makeSut([existing]);

    await expect(
      useCase.execute({ ...VALID_INPUT, email: "JOAO@SILVA.COM" }),
    ).rejects.toMatchObject({ statusCode: 409 });
  });
});
