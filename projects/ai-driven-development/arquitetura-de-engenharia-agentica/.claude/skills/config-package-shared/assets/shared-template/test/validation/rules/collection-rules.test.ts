import {
  InRule,
  MaxItemsRule,
  MinItemsRule,
  NotInRule,
  UniqueItemsRule,
} from "../../../src/index";

describe("Collection rules", () => {
  test("MinItemsRule deve validar quantidade minima de itens", () => {
    const rule = new MinItemsRule(2);

    expect(rule.validate(["a", "b"])).toBeNull();
    expect(rule.validate(["a"])).toBe("min.items");
    expect(rule.validate([])).toBeNull();
    expect(rule.validate("abc")).toBe("min.items");
  });

  test("MaxItemsRule deve validar quantidade maxima de itens", () => {
    const rule = new MaxItemsRule(2);

    expect(rule.validate(["a"])).toBeNull();
    expect(rule.validate(["a", "b", "c"])).toBe("max.items");
    expect(rule.validate([])).toBeNull();
  });

  test("UniqueItemsRule deve reprovar itens duplicados", () => {
    const rule = new UniqueItemsRule();

    expect(rule.validate(["a", "b", { id: 1 }])).toBeNull();
    expect(rule.validate(["a", "a"])).toBe("unique.items");
    expect(rule.validate("abc")).toBe("unique.items");
    expect(rule.validate([])).toBeNull();
  });

  test("InRule deve aceitar apenas valores permitidos", () => {
    const date = new Date("2026-03-31T00:00:00.000Z");
    const circular: Record<string, unknown> = {};

    circular.self = circular;

    const rule = new InRule(["a", 1, { id: 1 }, date, circular]);

    expect(rule.validate(["a", 1])).toBeNull();
    expect(rule.validate({ id: 1 })).toBeNull();
    expect(rule.validate(new Date("2026-03-31T00:00:00.000Z"))).toBeNull();
    expect(rule.validate(circular)).toBeNull();
    expect(new InRule([Number.NaN]).validate(Number.NaN)).toBeNull();
    expect(rule.validate("b")).toBe("in");
  });

  test("NotInRule deve bloquear valores proibidos", () => {
    const rule = new NotInRule(["admin", "root"]);

    expect(rule.validate("user")).toBeNull();
    expect(rule.validate(["user", "guest"])).toBeNull();
    expect(rule.validate("admin")).toBe("not.in");
  });
});
