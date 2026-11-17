import { AgeRule } from "../../../src/index";

describe("AgeRule", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-31T12:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("deve aceitar idade dentro da faixa", () => {
    const rule = new AgeRule(18, 65);

    expect(rule.validate("2000-03-31")).toBeNull();
    expect(rule.validate("1961-03-31")).toBeNull();
  });

  test("deve reprovar idade fora da faixa", () => {
    const rule = new AgeRule(18, 65);

    expect(rule.validate("2010-04-01")).toBe("age.range");
    expect(rule.validate("1940-03-30")).toBe("age.range");
  });

  test("deve reprovar data invalida e ignorar valores vazios", () => {
    const rule = new AgeRule(18, 65);

    expect(rule.validate("data-invalida")).toBe("age.range");
    expect(rule.validate("")).toBeNull();
    expect(rule.validate(null)).toBeNull();
  });

  test("deve ajustar a idade quando o aniversario ainda nao aconteceu no ano de referencia", () => {
    const rule = new AgeRule(18, 65) as AgeRule & {
      getAgeFromBirthDate(birthDate: Date, referenceDate: Date): number;
    };

    expect(
      rule.getAgeFromBirthDate(
        new Date(2008, 3, 1),
        new Date(2026, 2, 31, 12),
      ),
    ).toBe(17);
  });
});
