import {
  DateRangeRule,
  DateStringRule,
  FutureDateRule,
  MaxDateRule,
  MinDateRule,
  PastDateRule,
  TimeStringRule,
} from "../../../src/index";

describe("Date and time rules", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-31T12:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("DateStringRule deve aceitar datas ISO 8601 validas", () => {
    const rule = new DateStringRule();

    expect(
      rule.validate([
        "2026-03-31",
        "2026-03-31T12:30",
        "2026-03-31T12:30:45Z",
        "2026-03-31T12:30:45+03:00",
      ]),
    ).toBeNull();
    expect(rule.validate("31/03/2026")).toBe("date.string");
    expect(rule.validate("2026-02-30")).toBe("date.string");
    expect(rule.validate("2026-03-31T24:00")).toBe("date.string");
    expect(rule.validate("2026-03-31T12:00+24:00")).toBe("date.string");
    expect(rule.validate(new Date())).toBe("date.string");
  });

  test("MinDateRule deve validar a data minima", () => {
    const rule = new MinDateRule("2026-01-01");
    const invalidConfigRule = new MinDateRule("data-invalida");

    expect(rule.validate("2026-03-31")).toBeNull();
    expect(rule.validate(new Date("2025-12-31T23:59:59.000Z"))).toBe("min.date");
    expect(rule.validate({})).toBe("min.date");
    expect(invalidConfigRule.validate("2026-03-31")).toBe("min.date");
  });

  test("MaxDateRule deve validar a data maxima", () => {
    const rule = new MaxDateRule("2026-12-31");
    const invalidConfigRule = new MaxDateRule("data-invalida");

    expect(rule.validate([new Date("2026-03-31T00:00:00.000Z")])).toBeNull();
    expect(rule.validate("2027-01-01")).toBe("max.date");
    expect(invalidConfigRule.validate("2026-03-31")).toBe("max.date");
  });

  test("DateRangeRule deve validar intervalo de datas", () => {
    const rule = new DateRangeRule("2026-01-01", "2026-12-31");
    const invalidMinRule = new DateRangeRule("data-invalida", "2026-12-31");
    const invalidMaxRule = new DateRangeRule("2026-01-01", "data-invalida");

    expect(rule.validate("2026-06-01")).toBeNull();
    expect(rule.validate("2025-12-31")).toBe("date.range");
    expect(rule.validate("2027-01-01")).toBe("date.range");
    expect(invalidMinRule.validate("2026-06-01")).toBe("date.range");
    expect(invalidMaxRule.validate("2026-06-01")).toBe("date.range");
  });

  test("FutureDateRule deve aceitar apenas datas futuras", () => {
    const rule = new FutureDateRule();

    expect(rule.validate("2026-03-31T12:00:01.000Z")).toBeNull();
    expect(rule.validate("2026-03-31T12:00:00.000Z")).toBe("future.date");
  });

  test("PastDateRule deve aceitar apenas datas passadas", () => {
    const rule = new PastDateRule();

    expect(rule.validate("2026-03-31T11:59:59.000Z")).toBeNull();
    expect(rule.validate("2026-04-01T00:00:00.000Z")).toBe("past.date");
  });

  test("TimeStringRule deve validar horarios HH:mm e HH:mm:ss", () => {
    const rule = new TimeStringRule();

    expect(rule.validate("23:59")).toBeNull();
    expect(rule.validate("23:59:59")).toBeNull();
    expect(rule.validate("24:00")).toBe("time.string");
    expect(rule.validate(1200)).toBe("time.string");
  });
});
