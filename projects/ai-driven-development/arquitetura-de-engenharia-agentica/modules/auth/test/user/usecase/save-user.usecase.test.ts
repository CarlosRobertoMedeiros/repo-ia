import { DomainError, ValidationException } from "@sdd/shared";
import { SaveUser, SaveUserIn, User } from "../../../src";
import { FakeCryptoProvider, FakeUserRepository } from "../../mock";

const PASSWORD = "Senha@12345";
const NEW_PASSWORD = "Nova@Senha789";
const KNOWN_ID = "123e4567-e89b-42d3-a456-426614174000";

async function makeSut(extraUsers: Array<{ email: string; name: string }> = []) {
  const cryptoProvider = new FakeCryptoProvider();
  const existing = new User({
    name: "Joao Silva",
    email: "joao@silva.com",
    password: await cryptoProvider.encrypt(PASSWORD),
  });
  const others = await Promise.all(
    extraUsers.map(
      async ({ email, name }) =>
        new User({ name, email, password: await cryptoProvider.encrypt(PASSWORD) }),
    ),
  );
  const userRepository = new FakeUserRepository([existing, ...others]);
  const useCase = new SaveUser(cryptoProvider, userRepository);

  // zera o rastro do encrypt usado so para montar os usuarios do cenario
  cryptoProvider.encryptedPasswords.length = 0;

  return { cryptoProvider, userRepository, useCase, existing, others };
}

async function getError(promise: Promise<unknown>): Promise<unknown> {
  return promise.catch((error: unknown) => error);
}

function getMessages(error: unknown): string[] {
  return (error as ValidationException).errors.map((item) => item.message);
}

const NEW_USER: SaveUserIn = {
  name: "Maria Souza",
  email: "maria@souza.com",
  password: PASSWORD,
};

describe("SaveUser - criacao", () => {
  test("deve criar quando nao vier id, gerando um novo", async () => {
    const { cryptoProvider, userRepository, useCase, existing } = await makeSut();

    await expect(useCase.execute(NEW_USER)).resolves.toBeUndefined();

    expect(userRepository.users).toHaveLength(2);
    const created = userRepository.users.find((u) => u.email === "maria@souza.com")!;
    expect(created.id).not.toBe(existing.id);
    expect(created.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(created.name).toBe("Maria Souza");
    expect(created.password).not.toBe(PASSWORD);
    expect(cryptoProvider.encryptedPasswords).toEqual([PASSWORD]);
  });

  test("deve criar usando o id recebido quando o usuario nao existir no repositorio", async () => {
    const { userRepository, useCase } = await makeSut();

    await useCase.execute({ ...NEW_USER, id: KNOWN_ID });

    await expect(userRepository.findById(KNOWN_ID)).resolves.toMatchObject({
      id: KNOWN_ID,
      email: "maria@souza.com",
    });
  });

  test("deve normalizar nome e e-mail", async () => {
    const { userRepository, useCase } = await makeSut();

    await useCase.execute({ ...NEW_USER, name: " Maria Souza ", email: " MARIA@Souza.com " });

    const created = userRepository.users.find((u) => u.id !== undefined && u.name === "Maria Souza")!;
    expect(created.email).toBe("maria@souza.com");
  });

  test.each([
    ["ausente", undefined],
    ["vazia", ""],
  ])("deve exigir senha na criacao quando ela for %s", async (_label, password) => {
    const { cryptoProvider, userRepository, useCase } = await makeSut();

    const error = await getError(useCase.execute({ ...NEW_USER, password }));

    expect(error).toBeInstanceOf(ValidationException);
    expect(getMessages(error)).toContain("user.password.required");
    expect(cryptoProvider.encryptedPasswords).toEqual([]);
    expect(userRepository.users).toHaveLength(1);
  });

  test("deve rejeitar senha fraca na criacao", async () => {
    const { userRepository, useCase } = await makeSut();

    const error = await getError(useCase.execute({ ...NEW_USER, password: "123456" }));

    expect(getMessages(error)).toContain("user.password.strong.password");
    expect(userRepository.users).toHaveLength(1);
  });

  test("deve rejeitar com 409 quando o e-mail ja estiver em uso", async () => {
    const { cryptoProvider, userRepository, useCase } = await makeSut();

    const error = await getError(useCase.execute({ ...NEW_USER, email: "JOAO@silva.com" }));

    expect(error).toBeInstanceOf(DomainError);
    expect((error as DomainError).statusCode).toBe(409);
    expect((error as DomainError).message).toBe("user.email.already.registered");
    expect(cryptoProvider.encryptedPasswords).toEqual([]);
    expect(userRepository.users).toHaveLength(1);
  });

  test("deve acumular erros de nome, e-mail e senha", async () => {
    const { useCase } = await makeSut();

    const error = await getError(useCase.execute({ name: "Al", email: "x", password: "1" }));

    expect(getMessages(error)).toEqual(
      expect.arrayContaining([
        "user.name.min.length",
        "user.name.person.name",
        "user.email.invalid.email",
        "user.password.strong.password",
      ]),
    );
  });

  test("deve rejeitar id que nao seja UUID ao criar com id informado", async () => {
    const { userRepository, useCase } = await makeSut();

    const error = await getError(useCase.execute({ ...NEW_USER, id: "nao-e-uuid" }));

    expect(error).toBeInstanceOf(ValidationException);
    expect(userRepository.users).toHaveLength(1);
  });
});

describe("SaveUser - atualizacao", () => {
  test("deve manter o hash atual, sem re-hashear, quando a senha vier ausente", async () => {
    const { cryptoProvider, userRepository, useCase, existing } = await makeSut();
    const originalHash = existing.password;

    await useCase.execute({ id: existing.id, name: "Joao Pereira", email: "joao.pereira@silva.com" });

    const updated = (await userRepository.findById(existing.id))!;
    expect(updated.name).toBe("Joao Pereira");
    expect(updated.email).toBe("joao.pereira@silva.com");
    expect(updated.password).toBe(originalHash);
    expect(updated.createdAt).toEqual(existing.createdAt);
    expect(cryptoProvider.encryptedPasswords).toEqual([]);
    expect(userRepository.users).toHaveLength(1);
  });

  test("deve manter o hash atual quando a senha vier vazia", async () => {
    const { cryptoProvider, userRepository, useCase, existing } = await makeSut();
    const originalHash = existing.password;

    await useCase.execute({ id: existing.id, name: "Joao Silva", email: "joao@silva.com", password: "" });

    expect((await userRepository.findById(existing.id))!.password).toBe(originalHash);
    expect(cryptoProvider.encryptedPasswords).toEqual([]);
  });

  test("deve gerar novo hash quando uma nova senha for informada", async () => {
    const { cryptoProvider, userRepository, useCase, existing } = await makeSut();
    const originalHash = existing.password;

    await useCase.execute({
      id: existing.id,
      name: "Joao Silva",
      email: "joao@silva.com",
      password: NEW_PASSWORD,
    });

    const updated = (await userRepository.findById(existing.id))!;
    expect(updated.password).not.toBe(originalHash);
    expect(await cryptoProvider.compare(NEW_PASSWORD, updated.password)).toBe(true);
    expect(cryptoProvider.encryptedPasswords).toEqual([NEW_PASSWORD]);
  });

  test("deve rejeitar nova senha fraca sem alterar o usuario", async () => {
    const { userRepository, useCase, existing } = await makeSut();
    const originalHash = existing.password;

    const error = await getError(
      useCase.execute({ id: existing.id, name: "Joao Silva", email: "joao@silva.com", password: "123456" }),
    );

    expect(getMessages(error)).toContain("user.password.strong.password");
    expect((await userRepository.findById(existing.id))!.password).toBe(originalHash);
  });

  test("deve permitir manter o proprio e-mail", async () => {
    const { userRepository, useCase, existing } = await makeSut();

    await expect(
      useCase.execute({ id: existing.id, name: "Joao Pereira", email: "JOAO@silva.com" }),
    ).resolves.toBeUndefined();

    expect((await userRepository.findById(existing.id))!.name).toBe("Joao Pereira");
  });

  test("deve rejeitar com 409 ao trocar para o e-mail de outro usuario", async () => {
    const { userRepository, useCase, existing } = await makeSut([
      { email: "maria@souza.com", name: "Maria Souza" },
    ]);

    const error = await getError(
      useCase.execute({ id: existing.id, name: "Joao Silva", email: "maria@souza.com" }),
    );

    expect((error as DomainError).statusCode).toBe(409);
    expect((await userRepository.findById(existing.id))!.email).toBe("joao@silva.com");
  });

  test("deve validar nome e e-mail tambem na atualizacao", async () => {
    const { useCase, existing } = await makeSut();

    const error = await getError(useCase.execute({ id: existing.id, name: "Al", email: "x" }));

    expect(error).toBeInstanceOf(ValidationException);
    expect(getMessages(error)).toEqual(
      expect.arrayContaining(["user.name.min.length", "user.email.invalid.email"]),
    );
  });
});
