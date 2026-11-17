import { ValidationException } from "@sdd/shared";
import { PRODUCT_STATUSES, Product, ProductState } from "../../../src/product/model/product.entity";

const VALID_ID = "123e4567-e89b-42d3-a456-426614174000";

function makeState(overrides: Partial<ProductState> = {}): ProductState {
  return {
    id: VALID_ID,
    name: "Cafe Especial",
    description: "Graos selecionados",
    price: 49.9,
    status: "active",
    availableOnline: true,
    featured: false,
    allowsPreOrder: true,
    ...overrides,
  };
}

function messages(state: Partial<ProductState>): string[] {
  try {
    new Product(makeState(state)).validate();
    return [];
  } catch (error) {
    return (error as ValidationException).errors.map((item) => item.message);
  }
}

describe("Product", () => {
  test("deve expor os getters", () => {
    const product = new Product(makeState());

    expect(product.id).toBe(VALID_ID);
    expect(product.name).toBe("Cafe Especial");
    expect(product.description).toBe("Graos selecionados");
    expect(product.price).toBe(49.9);
    expect(product.status).toBe("active");
    expect(product.availableOnline).toBe(true);
    expect(product.featured).toBe(false);
    expect(product.allowsPreOrder).toBe(true);
  });

  test("deve assumir description null e booleanos false quando ausentes", () => {
    const product = new Product({ name: "Cha", price: 10, status: "draft" });

    expect(product.description).toBeNull();
    expect(product.availableOnline).toBe(false);
    expect(product.featured).toBe(false);
    expect(product.allowsPreOrder).toBe(false);
    expect(() => product.validate()).not.toThrow();
  });

  test("deve permitir existir invalido antes do validate", () => {
    expect(() => new Product(makeState({ name: "", price: -1 }))).not.toThrow();
  });

  test("deve expor a enumeracao de status", () => {
    expect(PRODUCT_STATUSES).toEqual(["active", "inactive", "draft"]);
  });

  test.each(PRODUCT_STATUSES)("deve aceitar o status %s", (status) => {
    expect(messages({ status })).toEqual([]);
  });

  test.each<[string, Partial<ProductState>, string]>([
    ["nome vazio", { name: "" }, "product.name.required"],
    ["nome com 1 caractere", { name: "A" }, "product.name.min.length"],
    ["nome com 121 caracteres", { name: "a".repeat(121) }, "product.name.max.length"],
    ["descricao com 501 caracteres", { description: "a".repeat(501) }, "product.description.max.length"],
    ["preco ausente", { price: undefined as unknown as number }, "product.price.required"],
    ["preco negativo", { price: -0.01 }, "product.price.min.value"],
    ["preco com 3 casas", { price: 10.123 }, "product.price.precision"],
    ["preco nao numerico", { price: "10" as unknown as number }, "product.price.min.value"],
    ["status ausente", { status: undefined as unknown as ProductState["status"] }, "product.status.required"],
    ["status fora da enumeracao", { status: "archived" as ProductState["status"] }, "product.status.in"],
    ["availableOnline nao booleano", { availableOnline: "sim" as unknown as boolean }, "product.availableOnline.boolean"],
    ["featured nao booleano", { featured: 1 as unknown as boolean }, "product.featured.boolean"],
    ["allowsPreOrder nao booleano", { allowsPreOrder: "true" as unknown as boolean }, "product.allowsPreOrder.boolean"],
  ])("deve rejeitar %s", (_label, state, expected) => {
    expect(messages(state)).toContain(expected);
  });

  test.each<[string, Partial<ProductState>]>([
    ["nome com 2 caracteres", { name: "Ab" }],
    ["nome com 120 caracteres", { name: "a".repeat(120) }],
    ["descricao com 500 caracteres", { description: "a".repeat(500) }],
    ["descricao nula", { description: null }],
    ["preco zero", { price: 0 }],
    ["preco com 2 casas", { price: 10.99 }],
  ])("deve aceitar %s", (_label, state) => {
    expect(messages(state)).toEqual([]);
  });

  test("clone deve preservar id e createdAt e atualizar campos", () => {
    const createdAt = new Date("2026-01-01T00:00:00.000Z");
    const product = new Product(makeState({ createdAt }));
    const cloned = product.clone({ price: 59.9, featured: true });

    expect(cloned.id).toBe(product.id);
    expect(cloned.createdAt).toEqual(createdAt);
    expect(cloned.price).toBe(59.9);
    expect(cloned.featured).toBe(true);
    expect(product.price).toBe(49.9);
  });
});
