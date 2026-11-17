import { Module } from '@nestjs/common';
import { DbModule } from '../../db/db.module';
import { CatalogController } from './catalog.controller';
import { ProductController } from './product.controller';
import { PrismaProductRepository } from './product.prisma';

@Module({
  imports: [DbModule],
  controllers: [CatalogController, ProductController],
  providers: [PrismaProductRepository],
  exports: [PrismaProductRepository],
})
export class CatalogModule {}
