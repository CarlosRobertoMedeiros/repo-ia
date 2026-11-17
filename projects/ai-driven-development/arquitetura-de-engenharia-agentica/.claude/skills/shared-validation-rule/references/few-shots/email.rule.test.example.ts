import { EmailRule } from "../../../src/index";

describe("EmailRule", () => {
  test("deve aceitar emails validos", () => {
    const rule = new EmailRule();

    expect(rule.validate("john@doe.com")).toBeNull();
    expect(rule.validate(" john@doe.com ")).toBeNull();
  });

  test("deve reprovar emails invalidos", () => {
    const rule = new EmailRule();

    expect(rule.validate("john@doe")).toBe("invalid.email");
    expect(rule.validate("john doe")).toBe("invalid.email");
    expect(rule.validate(123)).toBe("invalid.email");
  });

  test("deve ignorar valores vazios para permitir campo opcional", () => {
    const rule = new EmailRule();

    expect(rule.validate("")).toBeNull();
    expect(rule.validate("   ")).toBeNull();
    expect(rule.validate(null)).toBeNull();
    expect(rule.validate(undefined)).toBeNull();
  });
});
