import { DomainRule, PhoneRule, UrlRule } from "../../../src/index";

describe("Contact rules", () => {
  test("UrlRule deve aceitar apenas URLs http ou https", () => {
    const rule = new UrlRule();

    expect(rule.validate("https://example.com")).toBeNull();
    expect(rule.validate("http://example.com/path")).toBeNull();
    expect(rule.validate("ftp://example.com")).toBe("url");
    expect(rule.validate("example.com")).toBe("url");
  });

  test("PhoneRule deve usar E.164 por padrao e aceitar regex customizada", () => {
    const defaultRule = new PhoneRule();
    const customRule = new PhoneRule(/^\d{10,11}$/);

    expect(defaultRule.validate("+5511999999999")).toBeNull();
    expect(defaultRule.validate("11999999999")).toBe("phone");
    expect(customRule.validate("11999999999")).toBeNull();
    expect(customRule.validate("telefone")).toBe("phone");
  });

  test("DomainRule deve validar dominios sem protocolo", () => {
    const rule = new DomainRule();

    expect(rule.validate("example.com")).toBeNull();
    expect(rule.validate("sub.example.com")).toBeNull();
    expect(rule.validate("https://example.com")).toBe("domain");
    expect(rule.validate("localhost")).toBe("domain");
  });
});
