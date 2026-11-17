import { ValidationException } from "@sdd/shared";
import { User, UserState } from "../../../src/user/model/user.entity";

const VALID_ID = "123e4567-e89b-42d3-a456-426614174000";
const VALID_HASH = `$2b$10$${"a".repeat(53)}`;

function makeState(overrides: Partial<UserState> = {}): UserState {
  return {
    id: VALID_ID,
    name: "Maria da Silva",
    email: "maria@example.com",
    password: VALID_HASH,
    ...overrides,
  };
}

function getValidationMessages(callback: () => void): string[] {
  try {
    callback();
    return [];
  } catch (error) {
    return (error as ValidationException).errors.map((item) => item.message);
  }
}

describe("User", () => {
  it("deve criar um usuario valido e expor os getters", () => {
    const createdAt = new Date("2026-01-01T10:00:00.000Z");
    const user = new User(makeState({ createdAt }));

    expect(user.id).toBe(VALID_ID);
    expect(user.name).toBe("Maria da Silva");
    expect(user.email).toBe("maria@example.com");
    expect(user.password).toBe(VALID_HASH);
    expect(user.createdAt).toEqual(createdAt);
    expect(user.updatedAt).toEqual(createdAt);
    expect(user.deletedAt).toBeNull();
  });

  it("deve gerar id e timestamps quando nao informados", () => {
    const user = new User({
      name: "Maria da Silva",
      email: "maria@example.com",
      password: VALID_HASH,
    });

    expect(user.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);
  });

  it("deve permitir existir invalido antes do validate (validacao lazy)", () => {
    expect(
      () => new User(makeState({ name: "", email: "x", password: "plain" })),
    ).not.toThrow();
  });

  it("deve rejeitar id invalido na criacao (validacao da classe base)", () => {
    expect(() => new User(makeState({ id: "nao-e-uuid" }))).toThrow(
      ValidationException,
    );
  });

  it("deve passar no validate com dados validos", () => {
    expect(() => new User(makeState()).validate()).not.toThrow();
  });

  it("deve igualar usuarios pelo id", () => {
    const user = new User(makeState());

    expect(user.equals(new User(makeState({ name: "Joao Souza" })))).toBe(true);
    expect(user.equals(null)).toBe(false);
  });

  describe("name", () => {
    it("deve exigir nome", () => {
      const messages = getValidationMessages(() =>
        new User(makeState({ name: "" })).validate(),
      );

      expect(messages).toContain("user.name.required");
    });

    it("deve respeitar o tamanho minimo de 3 caracteres", () => {
      const messages = getValidationMessages(() =>
        new User(makeState({ name: "Al" })).validate(),
      );

      expect(messages).toContain("user.name.min.length");
      expect(
        getValidationMessages(() =>
          new User(makeState({ name: "A B" })).validate(),
        ),
      ).toEqual([]);
    });

    it("deve respeitar o tamanho maximo de 80 caracteres", () => {
      const limit = `Ana ${"a".repeat(76)}`;
      const above = `Ana ${"a".repeat(77)}`;

      expect(limit).toHaveLength(80);
      expect(
        getValidationMessages(() =>
          new User(makeState({ name: limit })).validate(),
        ),
      ).toEqual([]);
      expect(
        getValidationMessages(() =>
          new User(makeState({ name: above })).validate(),
        ),
      ).toContain("user.name.max.length");
    });

    it("deve exigir nome e sobrenome com letras", () => {
      expect(
        getValidationMessages(() =>
          new User(makeState({ name: "Maria" })).validate(),
        ),
      ).toContain("user.name.person.name");
      expect(
        getValidationMessages(() =>
          new User(makeState({ name: "Maria 123" })).validate(),
        ),
      ).toContain("user.name.person.name");
    });
  });

  describe("email", () => {
    it("deve exigir e-mail", () => {
      expect(
        getValidationMessages(() =>
          new User(makeState({ email: "" })).validate(),
        ),
      ).toContain("user.email.required");
    });

    it("deve rejeitar e-mail com formato invalido", () => {
      expect(
        getValidationMessages(() =>
          new User(makeState({ email: "maria.example.com" })).validate(),
        ),
      ).toContain("user.email.invalid.email");
    });
  });

  describe("password", () => {
    it("deve rejeitar senha que nao seja hash bcrypt", () => {
      expect(
        getValidationMessages(() =>
          new User(makeState({ password: "Senha@123" })).validate(),
        ),
      ).toContain("user.password.bcrypt.hash");
    });

    it("deve rejeitar hash bcrypt com tamanho incorreto", () => {
      expect(
        getValidationMessages(() =>
          new User(
            makeState({ password: `$2b$10$${"a".repeat(52)}` }),
          ).validate(),
        ),
      ).toContain("user.password.bcrypt.hash");
    });
  });

  it("deve acumular todos os erros de validacao", () => {
    const messages = getValidationMessages(() =>
      new User(makeState({ name: "", email: "", password: "plain" })).validate(),
    );

    expect(messages).toEqual(
      expect.arrayContaining([
        "user.name.required",
        "user.email.required",
        "user.password.bcrypt.hash",
      ]),
    );
  });

  describe("clone", () => {
    it("deve preservar id e createdAt e atualizar updatedAt", () => {
      const createdAt = new Date("2026-01-01T10:00:00.000Z");
      const user = new User(makeState({ createdAt }));
      const cloned = user.clone({ name: "Joao Souza" });

      expect(cloned).not.toBe(user);
      expect(cloned.id).toBe(user.id);
      expect(cloned.createdAt).toEqual(createdAt);
      expect(cloned.updatedAt.getTime()).toBeGreaterThan(createdAt.getTime());
      expect(cloned.name).toBe("Joao Souza");
      expect(user.name).toBe("Maria da Silva");
    });

    it("deve respeitar updatedAt informado e deletedAt", () => {
      const updatedAt = new Date("2026-02-01T10:00:00.000Z");
      const deletedAt = new Date("2026-03-01T10:00:00.000Z");
      const cloned = new User(makeState()).clone({ updatedAt, deletedAt });

      expect(cloned.updatedAt).toEqual(updatedAt);
      expect(cloned.deletedAt).toEqual(deletedAt);
    });
  });
});
