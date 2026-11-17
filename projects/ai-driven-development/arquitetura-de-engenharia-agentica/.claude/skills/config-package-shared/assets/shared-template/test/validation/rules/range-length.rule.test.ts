import { RangeLengthRule } from "../../../src/index";

describe("RangeLengthRule", () => {
  test("deve validar valores dentro do intervalo", () => {
    const rule = new RangeLengthRule(3, 5);

    expect(rule.validate("ab")).toBe("range.length");
    expect(rule.validate("abcd")).toBeNull();
    expect(rule.validate("abcdef")).toBe("range.length");
  });

  test("deve validar arrays dentro do intervalo", () => {
    const rule = new RangeLengthRule(2, 3);

    expect(rule.validate(["a"])).toBe("range.length");
    expect(rule.validate(["a", "b"])).toBeNull();
    expect(rule.validate(["a", "b", "c", "d"])).toBe("range.length");
  });

  test("deve reprovar valores sem length e ignorar vazios", () => {
    const rule = new RangeLengthRule(3, 5);

    expect(rule.validate({})).toBe("range.length");
    expect(rule.validate("")).toBeNull();
    expect(rule.validate(null)).toBeNull();
  });
});
