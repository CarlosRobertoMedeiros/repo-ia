import {
  DomainError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
  ValidationException,
} from "../src/index";

describe("shared errors", () => {
  test("deve criar o erro base com status code padrao", () => {
    const error = new DomainError("Erro de dominio");

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(DomainError);
    expect(error.name).toBe("DomainError");
    expect(error.message).toBe("Erro de dominio");
    expect(error.statusCode).toBe(500);
  });

  test("deve criar ValidationError com status 422", () => {
    const error = new ValidationError("user.email.invalid.email");

    expect(error).toBeInstanceOf(DomainError);
    expect(error.statusCode).toBe(422);
    expect(error.message).toBe("user.email.invalid.email");
  });

  test("deve criar NotFoundError com status 404", () => {
    const error = new NotFoundError("Recurso nao encontrado");

    expect(error).toBeInstanceOf(DomainError);
    expect(error.statusCode).toBe(404);
  });

  test("deve criar UnauthorizedError com status 401", () => {
    const error = new UnauthorizedError("Nao autorizado");

    expect(error).toBeInstanceOf(DomainError);
    expect(error.statusCode).toBe(401);
  });

  test("deve criar ValidationException com lista completa de erros", () => {
    const errors = [
      new ValidationError("user.email.invalid.email"),
      new ValidationError("user.name.min.length"),
    ];
    const error = new ValidationException(errors);

    expect(error).toBeInstanceOf(DomainError);
    expect(error.statusCode).toBe(422);
    expect(error.errors).toEqual(errors);
  });
});
