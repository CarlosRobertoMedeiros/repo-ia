import {
  IntegerRule,
  MaxValueRule,
  MinValueRule,
  NegativeRule,
  PositiveRule,
  PrecisionRule,
  RangeValueRule,
} from "../../../src/index";

describe("Numeric rules", () => {
  test("MinValueRule deve validar o valor minimo e reprovar tipos invalidos", () => {
    const rule = new MinValueRule(5);

    expect(rule.validate(5)).toBeNull();
    expect(rule.validate(10)).toBeNull();
    expect(rule.validate(4)).toBe("min.value");
    expect(rule.validate("5")).toBe("min.value");
    expect(rule.validate(undefined)).toBeNull();
  });

  test("MaxValueRule deve validar o valor maximo", () => {
    const rule = new MaxValueRule(5);

    expect(rule.validate(4)).toBeNull();
    expect(rule.validate(6)).toBe("max.value");
  });

  test("RangeValueRule deve validar valores e arrays numericos", () => {
    const rule = new RangeValueRule(1, 3);

    expect(rule.validate([1, 2, 3])).toBeNull();
    expect(rule.validate(4)).toBe("range.value");
  });

  test("IntegerRule deve aceitar apenas inteiros finitos", () => {
    const rule = new IntegerRule();

    expect(rule.validate(-2)).toBeNull();
    expect(rule.validate(1.2)).toBe("integer");
    expect(rule.validate(Number.NaN)).toBe("integer");
  });

  test("PositiveRule deve aceitar apenas numeros maiores que zero", () => {
    const rule = new PositiveRule();

    expect(rule.validate(1)).toBeNull();
    expect(rule.validate(0)).toBe("positive");
  });

  test("NegativeRule deve aceitar apenas numeros menores que zero", () => {
    const rule = new NegativeRule();

    expect(rule.validate(-1)).toBeNull();
    expect(rule.validate(0)).toBe("negative");
  });

  test("PrecisionRule deve limitar a quantidade de casas decimais", () => {
    const rule = new PrecisionRule(2);
    const scientificRule = new PrecisionRule(6);
    const integerScientificRule = new PrecisionRule(0);

    expect(rule.validate(1)).toBeNull();
    expect(rule.validate(1.23)).toBeNull();
    expect(rule.validate(1.234)).toBe("precision");
    expect(scientificRule.validate(1e-7)).toBe("precision");
    expect(integerScientificRule.validate(1e3)).toBeNull();
  });
});
