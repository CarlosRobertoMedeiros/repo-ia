import {
  EqualsRule,
  NotEqualsRule,
  NotNullRule,
  NotUndefinedRule,
} from "../../../src/index";

describe("Logic rules", () => {
  test("NotNullRule deve reprovar apenas null explicitamente", () => {
    const rule = new NotNullRule();

    expect(rule.validate(null)).toBe("not.null");
    expect(rule.validate(undefined)).toBeNull();
    expect(rule.validate("")).toBeNull();
  });

  test("NotUndefinedRule deve reprovar apenas undefined explicitamente", () => {
    const rule = new NotUndefinedRule();

    expect(rule.validate(undefined)).toBe("not.undefined");
    expect(rule.validate(null)).toBeNull();
    expect(rule.validate("")).toBeNull();
  });

  test("EqualsRule deve exigir igualdade com o valor esperado", () => {
    const rule = new EqualsRule("ok");

    expect(rule.validate("ok")).toBeNull();
    expect(rule.validate(["ok", "ok"])).toBeNull();
    expect(rule.validate("ko")).toBe("equals");
    expect(rule.validate("")).toBeNull();
  });

  test("NotEqualsRule deve bloquear o valor proibido", () => {
    const rule = new NotEqualsRule(1);

    expect(rule.validate(2)).toBeNull();
    expect(rule.validate([2, 3])).toBeNull();
    expect(rule.validate(1)).toBe("not.equals");
  });
});
