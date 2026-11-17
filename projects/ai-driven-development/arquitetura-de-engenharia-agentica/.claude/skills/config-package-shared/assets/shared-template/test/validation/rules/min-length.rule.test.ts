import { MinLengthRule } from "../../../src/index";

describe("MinLengthRule", () => {
  test("deve validar o tamanho minimo de strings", () => {
    const rule = new MinLengthRule(3);

    expect(rule.validate("ab")).toBe("min.length");
    expect(rule.validate("abc")).toBeNull();
  });

  test("deve validar o tamanho minimo de arrays", () => {
    const rule = new MinLengthRule(2);

    expect(rule.validate(["a"])).toBe("min.length");
    expect(rule.validate(["a", "b"])).toBeNull();
  });

  test("deve reprovar valores sem length e ignorar vazios", () => {
    const rule = new MinLengthRule(3);

    expect(rule.validate(10)).toBe("min.length");
    expect(rule.validate("")).toBeNull();
    expect(rule.validate(null)).toBeNull();
  });
});
