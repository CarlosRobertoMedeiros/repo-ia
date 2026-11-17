import { DomainError, ValidationException } from "@sdd/shared";
import { LoginUser, User } from "../../../src";
import { FakeCryptoProvider, FakeUserRepository } from "../../mock";

const PASSWORD = "Senha@12345";

async function makeSut() {
  const cryptoProvider = new FakeCryptoProvider();
  const user = new User({
    name: "Jose da Conceicao",
    email: "jose@example.com",
    password: await cryptoProvider.encrypt(PASSWORD),
  });
  const userRepository = new FakeUserRepository([user]);
  const useCase = new LoginUser(cryptoProvider, userRepository);

  // zera o rastro do encrypt usado apenas para montar o usuario
  cryptoProvider.encryptedPasswords.length = 0;

  return { cryptoProvider, userRepository, useCase, user };
}

async function getError(promise: Promise<unknown>): Promise<unknown> {
  return promise.catch((error: unknown) => error);
}

function getMessages(error: unknown): string[] {
  return (error as ValidationException).errors.map((item) => item.message);
}

describe("LoginUser", () => {
  test("deve devolver apenas id, name e email com credenciais validas", async () => {
    const { cryptoProvider, useCase, user } = await makeSut();

    const output = await useCase.execute({
      email: "jose@example.com",
      password: PASSWORD,
    });

    expect(output).toEqual({
      id: user.id,
      name: "Jose da Conceicao",
      email: "jose@example.com",
    });
    expect(Object.keys(output).sort()).toEqual(["email", "id", "name"]);
    expect(output).not.toHaveProperty("password");
    expect(cryptoProvider.comparedPasswords).toEqual([PASSWORD]);
  });

  test("deve normalizar o e-mail antes de buscar o usuario", async () => {
    const { useCase, user } = await makeSut();

    await expect(
      useCase.execute({ email: "  JOSE@Example.com ", password: PASSWORD }),
    ).resolves.toMatchObject({ id: user.id });
  });

  test("deve rejeitar com 401 quando o e-mail nao estiver cadastrado", async () => {
    const { cryptoProvider, useCase } = await makeSut();

    const error = await getError(
      useCase.execute({ email: "ninguem@example.com", password: PASSWORD }),
    );

    expect(error).toBeInstanceOf(DomainError);
    expect((error as DomainError).statusCode).toBe(401);
    expect((error as DomainError).message).toBe("user.credentials.invalid");
    expect(cryptoProvider.comparedPasswords).toEqual([]);
  });

  test("deve rejeitar com 401 quando a senha estiver incorreta", async () => {
    const { cryptoProvider, useCase } = await makeSut();

    const error = await getError(
      useCase.execute({ email: "jose@example.com", password: "Outra@12345" }),
    );

    expect(error).toBeInstanceOf(DomainError);
    expect((error as DomainError).statusCode).toBe(401);
    expect((error as DomainError).message).toBe("user.credentials.invalid");
    expect(cryptoProvider.comparedPasswords).toEqual(["Outra@12345"]);
  });

  test("deve usar a mesma mensagem para e-mail inexistente e senha incorreta", async () => {
    const { useCase } = await makeSut();

    const unknownEmail = await getError(
      useCase.execute({ email: "ninguem@example.com", password: PASSWORD }),
    );
    const wrongPassword = await getError(
      useCase.execute({ email: "jose@example.com", password: "Outra@12345" }),
    );

    expect((unknownEmail as DomainError).message).toBe(
      (wrongPassword as DomainError).message,
    );
    expect((unknownEmail as DomainError).statusCode).toBe(
      (wrongPassword as DomainError).statusCode,
    );
  });

  test.each([
    ["e-mail vazio", { email: "", password: PASSWORD }, "user.email.required"],
    ["e-mail invalido", { email: "invalido", password: PASSWORD }, "user.email.invalid.email"],
    ["senha vazia", { email: "jose@example.com", password: "" }, "user.password.required"],
  ])(
    "deve rejeitar com 422 e nao consultar dependencias quando houver %s",
    async (_label, input, expectedMessage) => {
      const { cryptoProvider, useCase } = await makeSut();

      const error = await getError(useCase.execute(input));

      expect(error).toBeInstanceOf(ValidationException);
      expect(getMessages(error)).toContain(expectedMessage);
      expect(cryptoProvider.comparedPasswords).toEqual([]);
    },
  );

  test("deve acumular os erros quando e-mail e senha estiverem vazios", async () => {
    const { useCase } = await makeSut();

    const error = await getError(useCase.execute({ email: "", password: "" }));

    expect(getMessages(error)).toEqual(
      expect.arrayContaining(["user.email.required", "user.password.required"]),
    );
  });
});
