import { BooleanRule } from "../../../src/index";

describe("BooleanRule", () => {
  const rule = new BooleanRule();

  test("deve aceitar true e false", () => {
    expect(rule.validate(true)).toBeNull();
    expect(rule.validate(false)).toBeNull();
  });

  test("deve ignorar valores ausentes", () => {
    expect(rule.validate(undefined)).toBeNull();
    expect(rule.validate(null)).toBeNull();
  });

  test("deve reprovar valores que nao sejam booleanos", () => {
    for (const value of ["true", "", 0, 1, [], [true], {}]) {
      expect(rule.validate(value)).toBe("boolean");
    }
  });
});
