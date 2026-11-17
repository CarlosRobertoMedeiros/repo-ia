import { PageResult } from "@sdd/shared";
import { Product, ProductPageParams, ProductRepository } from "../../src";

export class FakeProductRepository implements ProductRepository {
  private readonly storage = new Map<string, Product>();

  constructor(initialProducts: Product[] = []) {
    for (const product of initialProducts) {
      this.storage.set(product.id, product);
    }
  }

  get products(): Product[] {
    return Array.from(this.storage.values());
  }

  async create(data: Product): Promise<Product> {
    this.storage.set(data.id, data);
    return data;
  }

  async update(data: Product): Promise<Product> {
    if (!this.storage.has(data.id)) {
      throw new Error(`Product with id "${data.id}" was not found.`);
    }

    this.storage.set(data.id, data);
    return data;
  }

  async delete(id: string): Promise<void> {
    this.storage.delete(id);
  }

  async findById(id: string): Promise<Product | null> {
    return this.storage.get(id) ?? null;
  }

  async findPage(params: ProductPageParams): Promise<PageResult<Product>> {
    const page = Math.max(params.page, 1);
    const perPage = Math.max(params.perPage, 1);
    const start = (page - 1) * perPage;
    const items = this.products.slice(start, start + perPage);

    return { items, page, perPage, total: this.storage.size };
  }
}
