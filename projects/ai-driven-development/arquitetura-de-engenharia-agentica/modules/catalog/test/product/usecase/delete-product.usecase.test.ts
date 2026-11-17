import { DomainError } from "@sdd/shared";
import { DeleteProduct, Product } from "../../../src";
import { FakeProductRepository } from "../../mock";

function makeProduct(name: string) {
  return new Product({ name, price: 10, status: "active" });
}

describe("DeleteProduct", () => {
  test("deve excluir o produto existente sem afetar os demais", async () => {
    const target = makeProduct("Cafe");
    const other = makeProduct("Cha");
    const productRepository = new FakeProductRepository([target, other]);

    await expect(new DeleteProduct(productRepository).execute({ id: target.id })).resolves.toBeUndefined();

    await expect(productRepository.findById(target.id)).resolves.toBeNull();
    expect(productRepository.products).toEqual([other]);
  });

  test("deve lancar DomainError product.not_found (404) quando o id nao existir", async () => {
    const other = makeProduct("Cha");
    const productRepository = new FakeProductRepository([other]);

    const error = await new DeleteProduct(productRepository)
      .execute({ id: "123e4567-e89b-42d3-a456-426614174000" })
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(DomainError);
    expect((error as DomainError).statusCode).toBe(404);
    expect((error as DomainError).message).toBe("product.not_found");
    expect(productRepository.products).toEqual([other]);
  });
});
