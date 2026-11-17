import { Injectable } from '@nestjs/common';
import type { Product as ProductRecord } from '@prisma/client';
import { Product, type ProductPageParams, type ProductRepository } from '@sdd/catalog';
import { PageResult } from '@sdd/shared';
import { PrismaService } from '../../db/prisma.service';

@Injectable()
export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Product): Promise<Product> {
    const created = await this.prisma.product.create({
      data: this.toPersistence(data),
    });

    return this.toDomain(created);
  }

  async update(data: Product): Promise<Product> {
    const updated = await this.prisma.product.update({
      where: { id: data.id },
      data: this.toPersistence(data),
    });

    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({
      where: { id },
    });
  }

  async findById(id: string): Promise<Product | null> {
    const found = await this.prisma.product.findUnique({
      where: { id },
    });

    return found ? this.toDomain(found) : null;
  }

  async findPage(params: ProductPageParams): Promise<PageResult<Product>> {
    const page = Math.max(params.page, 1);
    const perPage = Math.max(params.perPage, 1);
    const skip = (page - 1) * perPage;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        skip,
        take: perPage,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count(),
    ]);

    return {
      items: items.map((item) => this.toDomain(item)),
      page,
      perPage,
      total,
    };
  }

  private toPersistence(product: Product) {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      status: product.status,
      availableOnline: product.availableOnline,
      featured: product.featured,
      allowsPreOrder: product.allowsPreOrder,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      deletedAt: product.deletedAt ?? null,
    };
  }

  private toDomain(record: ProductRecord): Product {
    return new Product({
      id: record.id,
      name: record.name,
      description: record.description,
      // Decimal(12,2) no banco; o dominio trabalha com number.
      price: record.price.toNumber(),
      status: record.status,
      availableOnline: record.availableOnline,
      featured: record.featured,
      allowsPreOrder: record.allowsPreOrder,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      deletedAt: record.deletedAt,
    });
  }
}
