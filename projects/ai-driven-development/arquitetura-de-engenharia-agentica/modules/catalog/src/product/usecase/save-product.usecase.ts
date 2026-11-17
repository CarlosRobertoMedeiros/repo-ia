import { UseCase } from "@sdd/shared";
import { Product, ProductStatus } from "../model";
import { ProductRepository } from "../provider";

export interface SaveProductIn {
  id?: string;
  name: string;
  description?: string | null;
  price: number;
  status: ProductStatus;
  availableOnline?: boolean;
  featured?: boolean;
  allowsPreOrder?: boolean;
}

function normalizeText(value: unknown): unknown {
  return typeof value === "string" ? value.trim() : value;
}

/** Descricao vazia ou so com espacos vira `null`. */
function normalizeDescription(value: unknown): unknown {
  const normalized = normalizeText(value);

  return normalized === "" ? null : normalized;
}

/**
 * Cria ou atualiza um produto. Se `id` vier e `findById` encontrar o registro,
 * atualiza; caso contrario cria, usando o `id` recebido ou gerando um novo.
 * Na criacao, booleanos ausentes viram `false` e descricao ausente vira `null`;
 * na atualizacao, campos opcionais ausentes mantem o valor atual.
 */
export class SaveProduct implements UseCase<SaveProductIn, void> {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(input: SaveProductIn): Promise<void> {
    const existing = input.id
      ? await this.productRepository.findById(input.id)
      : null;

    const data = {
      name: normalizeText(input.name) as string,
      description: (input.description === undefined
        ? (existing?.description ?? null)
        : normalizeDescription(input.description)) as string | null,
      price: input.price,
      status: input.status,
      availableOnline: input.availableOnline ?? existing?.availableOnline ?? false,
      featured: input.featured ?? existing?.featured ?? false,
      allowsPreOrder: input.allowsPreOrder ?? existing?.allowsPreOrder ?? false,
    };

    if (existing) {
      const updated = existing.clone(data);

      updated.validate();
      await this.productRepository.update(updated);
      return;
    }

    const created = new Product({ id: input.id, ...data });

    created.validate();
    await this.productRepository.create(created);
  }
}
