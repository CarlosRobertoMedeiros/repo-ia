import { Product } from "../../src";
import { FakeProductRepository } from "./fake-product.repository";

describe("FakeProductRepository", () => {
  test("deve paginar e falhar ao atualizar registro inexistente", async () => {
    const products = ["A1", "B2", "C3"].map((name) => new Product({ name, price: 1, status: "active" }));
    const repository = new FakeProductRepository(products);

    await expect(repository.findPage({ page: 2, perPage: 2 })).resolves.toMatchObject({
      page: 2,
      perPage: 2,
      total: 3,
      items: [products[2]],
    });
    await expect(repository.update(new Product({ name: "Novo", price: 1, status: "draft" }))).rejects.toThrow();
  });
});
