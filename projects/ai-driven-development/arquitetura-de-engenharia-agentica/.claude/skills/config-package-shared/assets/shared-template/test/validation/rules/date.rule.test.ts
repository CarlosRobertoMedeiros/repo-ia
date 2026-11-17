import { DateRule } from "../../../src/index";

describe("DateRule", () => {
  test("deve aceitar datas validas", () => {
    const rule = new DateRule();

    expect(rule.validate("2026-03-31")).toBeNull();
    expect(rule.validate(1774915200000)).toBeNull();
    expect(rule.validate(new Date("2026-03-31T00:00:00.000Z"))).toBeNull();
  });

  test("deve reprovar datas invalidas", () => {
    const rule = new DateRule();

    expect(rule.validate("data-invalida")).toBe("invalid.date");
    expect(rule.validate(new Date("invalid"))).toBe("invalid.date");
    expect(rule.validate({})).toBe("invalid.date");
  });

  test("deve ignorar valores vazios para permitir campo opcional", () => {
    const rule = new DateRule();

    expect(rule.validate("")).toBeNull();
    expect(rule.validate(null)).toBeNull();
    expect(rule.validate(undefined)).toBeNull();
  });
});
