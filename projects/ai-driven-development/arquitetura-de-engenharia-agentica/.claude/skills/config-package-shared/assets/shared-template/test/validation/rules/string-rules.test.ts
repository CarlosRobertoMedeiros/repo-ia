import {
  AlphaNumericRule,
  AlphaRule,
  ContainsRule,
  EndsWithRule,
  LowerCaseRule,
  NoWhitespaceRule,
  PersonNameRule,
  RegexRule,
  StartsWithRule,
  TrimRule,
  UpperCaseRule,
} from "../../../src/index";

describe("String rules", () => {
  test("TrimRule deve aceitar strings sem espacos externos e ignorar vazio", () => {
    const rule = new TrimRule();

    expect(rule.validate("texto")).toBeNull();
    expect(rule.validate(["abc", "def"])).toBeNull();
    expect(rule.validate(" texto ")).toBe("trim");
    expect(rule.validate("")).toBeNull();
    expect(rule.validate(null)).toBeNull();
  });

  test("NoWhitespaceRule deve reprovar qualquer espaco em branco", () => {
    const rule = new NoWhitespaceRule();

    expect(rule.validate("abcdef")).toBeNull();
    expect(rule.validate("abc def")).toBe("no.whitespace");
    expect(rule.validate(123)).toBe("no.whitespace");
  });

  test("AlphaRule deve aceitar apenas letras", () => {
    const rule = new AlphaRule();

    expect(rule.validate("abcXYZ")).toBeNull();
    expect(rule.validate("abc1")).toBe("alpha");
  });

  test("PersonNameRule deve aceitar nomes completos com espacos extras e rejeitar formatos invalidos", () => {
    const rule = new PersonNameRule();

    expect(rule.validate("Joao Silva")).toBeNull();
    expect(rule.validate("  Maria   Clara  Souza ")).toBeNull();
    expect(rule.validate("Ana Maria")).toBeNull();
    expect(rule.validate("Joao")).toBe("person.name");
    expect(rule.validate("Jo@o Silva")).toBe("person.name");
    expect(rule.validate("Joao 123 Silva")).toBe("person.name");
  });

  test("AlphaNumericRule deve aceitar apenas letras e numeros", () => {
    const rule = new AlphaNumericRule();

    expect(rule.validate("abc123")).toBeNull();
    expect(rule.validate("abc-123")).toBe("alpha.numeric");
  });

  test("StartsWithRule deve validar prefixos", () => {
    const rule = new StartsWithRule("pre");

    expect(rule.validate(["prefixo", "preparo"])).toBeNull();
    expect(rule.validate("sufixo")).toBe("starts.with");
  });

  test("EndsWithRule deve validar sufixos", () => {
    const rule = new EndsWithRule(".txt");

    expect(rule.validate("arquivo.txt")).toBeNull();
    expect(rule.validate("arquivo.csv")).toBe("ends.with");
  });

  test("ContainsRule deve validar substring", () => {
    const rule = new ContainsRule("mid");

    expect(rule.validate("prefix-mid-suffix")).toBeNull();
    expect(rule.validate("prefix-suffix")).toBe("contains");
  });

  test("RegexRule deve aceitar string ou regexp e resetar lastIndex", () => {
    const globalRule = new RegexRule(/foo/g);
    const stringRule = new RegexRule("^\\d+$");

    expect(globalRule.validate("foo")).toBeNull();
    expect(globalRule.validate("foo")).toBeNull();
    expect(stringRule.validate("123")).toBeNull();
    expect(stringRule.validate("abc")).toBe("regex");
  });

  test("UpperCaseRule deve aceitar apenas letras maiusculas", () => {
    const rule = new UpperCaseRule();

    expect(rule.validate("ABC")).toBeNull();
    expect(rule.validate("AB1")).toBe("upper.case");
  });

  test("LowerCaseRule deve aceitar apenas letras minusculas", () => {
    const rule = new LowerCaseRule();

    expect(rule.validate("abc")).toBeNull();
    expect(rule.validate("Abc")).toBe("lower.case");
  });
});
