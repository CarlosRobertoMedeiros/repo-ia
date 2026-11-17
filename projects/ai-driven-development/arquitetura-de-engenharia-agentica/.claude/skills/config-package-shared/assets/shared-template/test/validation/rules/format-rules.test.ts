import {
  HexColorRule,
  JsonStringRule,
  SlugRule,
  UuidRule,
} from "../../../src/index";

describe("Format rules", () => {
  test("UuidRule deve aceitar apenas UUID v4", () => {
    const rule = new UuidRule();

    expect(rule.validate("550e8400-e29b-41d4-a716-446655440000")).toBeNull();
    expect(rule.validate("6ba7b810-9dad-11d1-80b4-00c04fd430c8")).toBe("uuid");
  });

  test("SlugRule deve aceitar apenas slugs validos", () => {
    const rule = new SlugRule();

    expect(rule.validate("meu-texto-aqui")).toBeNull();
    expect(rule.validate("MeuTextoAqui")).toBe("slug");
  });

  test("HexColorRule deve validar cores hexadecimais", () => {
    const rule = new HexColorRule();

    expect(rule.validate("#FFF")).toBeNull();
    expect(rule.validate("#ffffff")).toBeNull();
    expect(rule.validate("FFF")).toBe("hex.color");
  });

  test("JsonStringRule deve validar JSON parseavel", () => {
    const rule = new JsonStringRule();

    expect(rule.validate('{"name":"john"}')).toBeNull();
    expect(rule.validate("[]")).toBeNull();
    expect(rule.validate("{")).toBe("json.string");
    expect(rule.validate("")).toBeNull();
  });
});
