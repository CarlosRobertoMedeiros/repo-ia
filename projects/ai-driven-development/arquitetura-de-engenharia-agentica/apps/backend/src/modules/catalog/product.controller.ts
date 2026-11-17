import { randomUUID } from 'node:crypto';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  DeleteProduct,
  SaveProduct,
  type Product,
  type SaveProductIn,
} from '@sdd/catalog';
import { DomainError } from '@sdd/shared';
import { PrismaProductRepository } from './product.prisma';

const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 10;
const MAX_PER_PAGE = 100;

// Entidades usam `props` protegido e getters de prototype: nao serializam via
// JSON.stringify. O retorno e montado explicitamente.
function toProductResponse(product: Product) {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    status: product.status,
    availableOnline: product.availableOnline,
    featured: product.featured,
    allowsPreOrder: product.allowsPreOrder,
  };
}

function toPositiveInt(
  value: string | undefined,
  fallback: number,
  max = Number.MAX_SAFE_INTEGER,
): number {
  const parsed = Number.parseInt(value ?? '', 10);

  if (!Number.isFinite(parsed) || parsed < 1) return fallback;

  return Math.min(parsed, max);
}

function productNotFound(): DomainError {
  return new DomainError('product.not_found', 404);
}

@Controller('products')
export class ProductController {
  constructor(private readonly productRepository: PrismaProductRepository) {}

  @Post()
  async create(@Body() body: SaveProductIn): Promise<{ id: string }> {
    const id = body.id ?? randomUUID();
    const useCase = new SaveProduct(this.productRepository);

    await useCase.execute({ ...body, id });

    return { id };
  }

  @Put(':id')
  @HttpCode(204)
  async update(
    @Param('id') id: string,
    @Body() body: SaveProductIn,
  ): Promise<void> {
    // PUT so atualiza: sem esta consulta o save-product criaria um produto novo.
    if (!(await this.productRepository.findById(id))) {
      throw productNotFound();
    }

    const useCase = new SaveProduct(this.productRepository);

    await useCase.execute({ ...body, id });
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string): Promise<void> {
    const useCase = new DeleteProduct(this.productRepository);

    await useCase.execute({ id });
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw productNotFound();
    }

    return toProductResponse(product);
  }

  @Get()
  async findPage(
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
  ) {
    const result = await this.productRepository.findPage({
      page: toPositiveInt(page, DEFAULT_PAGE),
      perPage: toPositiveInt(perPage, DEFAULT_PER_PAGE, MAX_PER_PAGE),
    });

    return { ...result, items: result.items.map(toProductResponse) };
  }
}
