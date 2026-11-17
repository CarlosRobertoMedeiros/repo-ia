import { ValidationException } from "@sdd/shared";
import { Product, SaveProduct, SaveProductIn } from "../../../src";
import { FakeProductRepository } from "../../mock";

const KNOWN_ID = "123e4567-e89b-42d3-a456-426614174000";

const NEW_PRODUCT: SaveProductIn = {
  name: "Cafe Especial",
  description: "Graos selecionados",
  price: 49.9,
  status: "active",
  availableOnline: true,
  featured: true,
  allowsPreOrder: false,
};

function makeExisting() {
  return new Product({
    name: "Cha Verde",
    description: "Folhas inteiras",
    price: 19.9,
    status: "draft",
    availableOnline: true,
    featured: true,
    allowsPreOrder: true,
  });
}

function makeSut(initial: Product[] = []) {
  const productRepository = new FakeProductRepository(initial);
  const useCase = new SaveProduct(productRepository);

  return { productRepository, useCase };
}

async function messagesOf(promise: Promise<unknown>): Promise<string[]> {
  const error = await promise.catch((e: unknown) => e);
  expect(error).toBeInstanceOf(ValidationException);
  return (error as ValidationException).errors.map((item) => item.message);
}

describe("SaveProduct - criacao", () => {
  test("deve criar gerando um id quando nenhum for informado", async () => {
    const { productRepository, useCase } = makeSut();

    await expect(useCase.execute(NEW_PRODUCT)).resolves.toBeUndefined();

    expect(productRepository.products).toHaveLength(1);
    const [created] = productRepository.products;
    expect(created!.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(created!).toMatchObject({
      name: "Cafe Especial",
      description: "Graos selecionados",
      price: 49.9,
      status: "active",
      availableOnline: true,
      featured: true,
      allowsPreOrder: false,
    });
  });

  test("deve criar com o id recebido quando ele nao existir no repositorio", async () => {
    const { productRepository, useCase } = makeSut([makeExisting()]);

    await useCase.execute({ ...NEW_PRODUCT, id: KNOWN_ID });

    expect(productRepository.products).toHaveLength(2);
    await expect(productRepository.findById(KNOWN_ID)).resolves.toMatchObject({ name: "Cafe Especial" });
  });

  test("deve assumir booleanos false e descricao null quando ausentes", async () => {
    const { productRepository, useCase } = makeSut();

    await useCase.execute({ name: "Cha", price: 10, status: "draft" });

    expect(productRepository.products[0]!).toMatchObject({
      description: null,
      availableOnline: false,
      featured: false,
      allowsPreOrder: false,
    });
  });

  test.each([
    ["vazia", ""],
    ["so com espacos", "   "],
    ["nula", null],
  ])("deve persistir descricao %s como null", async (_label, description) => {
    const { productRepository, useCase } = makeSut();

    await useCase.execute({ ...NEW_PRODUCT, description });

    expect(productRepository.products[0]!.description).toBeNull();
  });

  test("deve remover espacos das pontas de nome e descricao", async () => {
    const { productRepository, useCase } = makeSut();

    await useCase.execute({ ...NEW_PRODUCT, name: "  Cafe  ", description: "  Torra media  " });

    expect(productRepository.products[0]!.name).toBe("Cafe");
    expect(productRepository.products[0]!.description).toBe("Torra media");
  });

  test("deve acumular os erros de validacao sem persistir", async () => {
    const { productRepository, useCase } = makeSut();

    const messages = await messagesOf(
      useCase.execute({
        name: "A",
        price: -5.555,
        status: "archived" as SaveProductIn["status"],
        featured: "sim" as unknown as boolean,
      }),
    );

    expect(messages).toEqual(
      expect.arrayContaining([
        "product.name.min.length",
        "product.price.min.value",
        "product.price.precision",
        "product.status.in",
        "product.featured.boolean",
      ]),
    );
    expect(productRepository.products).toEqual([]);
  });

  test("deve rejeitar id que nao seja UUID ao criar com id informado", async () => {
    const { productRepository, useCase } = makeSut();

    await messagesOf(useCase.execute({ ...NEW_PRODUCT, id: "nao-e-uuid" }));

    expect(productRepository.products).toEqual([]);
  });
});

describe("SaveProduct - atualizacao", () => {
  test("deve atualizar o produto existente preservando id e createdAt", async () => {
    const existing = makeExisting();
    const { productRepository, useCase } = makeSut([existing]);

    await useCase.execute({ ...NEW_PRODUCT, id: existing.id });

    expect(productRepository.products).toHaveLength(1);
    const updated = (await productRepository.findById(existing.id))!;
    expect(updated).toMatchObject({
      name: "Cafe Especial",
      description: "Graos selecionados",
      price: 49.9,
      status: "active",
      availableOnline: true,
      featured: true,
      allowsPreOrder: false,
    });
    expect(updated.createdAt).toEqual(existing.createdAt);
  });

  test("deve manter descricao e booleanos atuais quando ausentes na atualizacao", async () => {
    const existing = makeExisting();
    const { productRepository, useCase } = makeSut([existing]);

    await useCase.execute({ id: existing.id, name: "Cha Branco", price: 25, status: "active" });

    expect((await productRepository.findById(existing.id))!).toMatchObject({
      name: "Cha Branco",
      description: "Folhas inteiras",
      price: 25,
      status: "active",
      availableOnline: true,
      featured: true,
      allowsPreOrder: true,
    });
  });

  test("deve limpar a descricao quando vier nula ou vazia na atualizacao", async () => {
    const existing = makeExisting();
    const { productRepository, useCase } = makeSut([existing]);

    await useCase.execute({ id: existing.id, name: "Cha Verde", price: 19.9, status: "draft", description: "" });

    expect((await productRepository.findById(existing.id))!.description).toBeNull();
  });

  test("deve rejeitar dados invalidos sem alterar o produto", async () => {
    const existing = makeExisting();
    const { productRepository, useCase } = makeSut([existing]);

    const messages = await messagesOf(
      useCase.execute({ id: existing.id, name: "Cha Verde", price: -1, status: "draft" }),
    );

    expect(messages).toContain("product.price.min.value");
    expect((await productRepository.findById(existing.id))!.price).toBe(19.9);
  });
});
