import { MaxLengthRule } from "../../../src/index";

describe("MaxLengthRule", () => {
  test("deve validar o tamanho maximo de strings", () => {
    const rule = new MaxLengthRule(5);

    expect(rule.validate("abc")).toBeNull();
    expect(rule.validate("abcdef")).toBe("max.length");
  });

  test("deve validar o tamanho maximo de arrays", () => {
    const rule = new MaxLengthRule(2);

    expect(rule.validate(["a", "b"])).toBeNull();
    expect(rule.validate(["a", "b", "c"])).toBe("max.length");
  });

  test("deve reprovar valores sem length e ignorar vazios", () => {
    const rule = new MaxLengthRule(5);

    expect(rule.validate(10)).toBe("max.length");
    expect(rule.validate("")).toBeNull();
    expect(rule.validate(undefined)).toBeNull();
  });
});
