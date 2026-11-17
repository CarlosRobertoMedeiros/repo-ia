import { StrongPasswordRule } from "../../../src/index";

describe("StrongPasswordRule", () => {
  test("deve validar senha forte com configuracao padrao e customizada", () => {
    const defaultRule = new StrongPasswordRule();
    const customRule = new StrongPasswordRule(12);

    expect(defaultRule.validate("Abcdef1!")).toBeNull();
    expect(defaultRule.validate("abcdef1!")).toBe("strong.password");
    expect(customRule.validate("Abcd1!")).toBe("strong.password");
  });
});
