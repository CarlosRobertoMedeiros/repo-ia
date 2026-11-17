import {
  BcryptHashRule,
  HasLowerCaseRule,
  HasNumberRule,
  HasSpecialCharRule,
  HasUpperCaseRule,
  NoCommonPasswordRule,
  NoRepeatCharsRule,
  StrongPasswordRule,
} from "../../../src/index";

describe("Security rules", () => {
  test("BcryptHashRule deve validar hashes bcrypt", () => {
    const rule = new BcryptHashRule();

    expect(
      rule.validate("$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"),
    ).toBeNull();
    expect(
      rule.validate("$2y$12$EXRkfkdmXn2gzds2SSitu.J8Y7qjY7oV9eVQ7H5PHeTtNKgH0W8wC"),
    ).toBeNull();
    expect(rule.validate("Senha@123")).toBe("bcrypt.hash");
    expect(
      rule.validate("$2b$10$hash-curto"),
    ).toBe("bcrypt.hash");
  });

  test("StrongPasswordRule deve validar senha forte", () => {
    const defaultRule = new StrongPasswordRule();
    const customRule = new StrongPasswordRule(12);

    expect(defaultRule.validate("Abcdef1!")).toBeNull();
    expect(defaultRule.validate("abcdef1!")).toBe("strong.password");
    expect(customRule.validate("Abcd1!")).toBe("strong.password");
  });

  test("NoCommonPasswordRule deve bloquear senhas da blacklist", () => {
    const defaultRule = new NoCommonPasswordRule();
    const customRule = new NoCommonPasswordRule(["senha123"]);

    expect(defaultRule.validate("123456")).toBe("no.common.password");
    expect(customRule.validate(" senha123 ")).toBe("no.common.password");
    expect(defaultRule.validate("Complex@123")).toBeNull();
  });

  test("NoRepeatCharsRule deve bloquear repeticoes consecutivas", () => {
    const defaultRule = new NoRepeatCharsRule();
    const customRule = new NoRepeatCharsRule(1);

    expect(defaultRule.validate("aabbcc")).toBeNull();
    expect(defaultRule.validate("aaab")).toBe("no.repeat.chars");
    expect(customRule.validate("aab")).toBe("no.repeat.chars");
  });

  test("HasUpperCaseRule deve exigir ao menos uma maiuscula", () => {
    const rule = new HasUpperCaseRule();

    expect(rule.validate("abcD")).toBeNull();
    expect(rule.validate("abcd")).toBe("has.upper.case");
  });

  test("HasLowerCaseRule deve exigir ao menos uma minuscula", () => {
    const rule = new HasLowerCaseRule();

    expect(rule.validate("ABCd")).toBeNull();
    expect(rule.validate("ABCD")).toBe("has.lower.case");
  });

  test("HasNumberRule deve exigir ao menos um numero", () => {
    const rule = new HasNumberRule();

    expect(rule.validate("abc1")).toBeNull();
    expect(rule.validate("abc")).toBe("has.number");
  });

  test("HasSpecialCharRule deve exigir ao menos um caractere especial", () => {
    const rule = new HasSpecialCharRule();

    expect(rule.validate("abc!")).toBeNull();
    expect(rule.validate("abc1")).toBe("has.special.char");
  });
});
