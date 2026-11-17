import { RequiredRule } from "../../../src/index";

describe("RequiredRule", () => {
  test("deve reprovar valores vazios", () => {
    const rule = new RequiredRule();

    expect(rule.validate("")).toBe("required");
    expect(rule.validate("   ")).toBe("required");
    expect(rule.validate([])).toBe("required");
    expect(rule.validate(null)).toBe("required");
    expect(rule.validate(undefined)).toBe("required");
  });

  test("deve aceitar valores preenchidos", () => {
    const rule = new RequiredRule();

    expect(rule.validate("john")).toBeNull();
    expect(rule.validate(false)).toBeNull();
    expect(rule.validate(0)).toBeNull();
    expect(rule.validate(["item"])).toBeNull();
  });
});
