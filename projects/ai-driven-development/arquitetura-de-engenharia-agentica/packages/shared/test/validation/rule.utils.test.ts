import {
  getComparableKey,
  getValueLength,
  isEmptyValue,
  testPattern,
  toValidDate,
  validateDateValues,
  validateEachValue,
  validateNumberValues,
  validateStringValues,
} from "../../src/validation/rule.utils";

describe("rule.utils", () => {
  test("isEmptyValue deve cobrir valores vazios e preenchidos", () => {
    expect(isEmptyValue(null)).toBe(true);
    expect(isEmptyValue(undefined)).toBe(true);
    expect(isEmptyValue("   ")).toBe(true);
    expect(isEmptyValue([])).toBe(true);
    expect(isEmptyValue("abc")).toBe(false);
    expect(isEmptyValue(["a"])).toBe(false);
    expect(isEmptyValue(0)).toBe(false);
  });

  test("getValueLength deve suportar string, array, objeto com length e valor invalido", () => {
    expect(getValueLength("abc")).toBe(3);
    expect(getValueLength(["a", "b"])).toBe(2);
    expect(getValueLength({ length: 4 })).toBe(4);
    expect(getValueLength({ length: "4" })).toBeNull();
    expect(getValueLength(10)).toBeNull();
  });

  test("toValidDate deve suportar Date, string, number e rejeitar invalidos", () => {
    expect(toValidDate(new Date("2026-04-01T00:00:00.000Z"))).toBeInstanceOf(
      Date,
    );
    expect(toValidDate("2026-04-01")).toBeInstanceOf(Date);
    expect(toValidDate(1775001600000)).toBeInstanceOf(Date);
    expect(toValidDate(new Date("invalid"))).toBeNull();
    expect(toValidDate({})).toBeNull();
  });

  test("helpers de validacao devem suportar valor unico, arrays e tipos invalidos", () => {
    expect(validateEachValue(["a", "b"], "invalid", (item) => item === "a")).toBe(
      "invalid",
    );
    expect(
      validateStringValues(["abc", "def"], "invalid", (item) => item.length === 3),
    ).toBeNull();
    expect(validateStringValues(1, "invalid", (item) => item.length === 1)).toBe(
      "invalid",
    );
    expect(
      validateNumberValues([1, 2], "invalid", (item) => item > 0),
    ).toBeNull();
    expect(
      validateDateValues(
        ["2026-04-01", "invalid"],
        "invalid",
        (item) => item.getUTCFullYear() === 2026,
      ),
    ).toBe("invalid");
  });

  test("helpers diversos devem resetar regex global e gerar chaves comparaveis", () => {
    const pattern = /foo/g;
    const circular: Record<string, unknown> = {};

    circular.self = circular;

    expect(testPattern(pattern, "foo")).toBe(true);
    expect(testPattern(pattern, "foo")).toBe(true);
    expect(getComparableKey(new Date("2026-04-01T00:00:00.000Z"))).toBe(
      "date:2026-04-01T00:00:00.000Z",
    );
    expect(getComparableKey(Number.NaN)).toBe("number:NaN");
    expect(getComparableKey({ id: 1 })).toBe('object:{"id":1}');
    expect(getComparableKey(circular)).toBe("object:[object Object]");
    expect(getComparableKey("abc")).toBe("string:abc");
  });
});
