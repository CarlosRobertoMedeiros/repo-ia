import { Controller, Get } from '@nestjs/common';

@Controller('catalog')
export class CatalogController {
  @Get('/')
  getCatalog() {
    return { message: 'Catalog endpoint' };
  }
}
