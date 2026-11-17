import {
  EmailRule,
  MinLengthRule,
  RangeLengthRule,
  RequiredRule,
  ValidationField,
  ValidationException,
  Validator,
} from "../../src/index";

describe("Validator", () => {
  test("deve passar sem retornar nada quando nao houver erros", () => {
    const fields: ValidationField[] = [
      {
        code: "name",
        value: "John Doe",
        rules: [new RequiredRule()],
      },
      {
        code: "email",
        value: "john@doe.com",
        rules: [new RequiredRule(), new EmailRule()],
      },
    ];

    expect(Validator.validate(fields)).toBeUndefined();
  });

  test("deve agregar erros de varios campos em uma unica execucao", () => {
    const fields: ValidationField[] = [
      {
        code: "id",
        value: "",
        rules: [new RequiredRule()],
      },
      {
        code: "name",
        value: "ab",
        rules: [new RequiredRule(), new RangeLengthRule(3, 10)],
      },
      {
        code: "email",
        value: "email-invalido",
        rules: [new RequiredRule(), new EmailRule()],
      },
      {
        code: "description",
        value: "curta",
        rules: [new MinLengthRule(10)],
      },
    ];

    try {
      Validator.validate(fields);
      fail("era esperado lancar ValidationException");
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationException);
      expect(
        (error as ValidationException).errors.map((item) => item.message),
      ).toEqual([
        "id.required",
        "name.range.length",
        "email.invalid.email",
        "description.min.length",
      ]);
    }
  });

  test("deve acumular todos os erros de um mesmo campo", () => {
    const fields: ValidationField[] = [
      {
        code: "email",
        value: "abc",
        rules: [new EmailRule(), new MinLengthRule(10)],
      },
    ];

    expect(() => Validator.validate(fields)).toThrow(ValidationException);

    try {
      Validator.validate(fields);
    } catch (error) {
      expect(
        (error as ValidationException).errors.map((item) => item.message),
      ).toEqual(["email.invalid.email", "email.min.length"]);
    }
  });
});
