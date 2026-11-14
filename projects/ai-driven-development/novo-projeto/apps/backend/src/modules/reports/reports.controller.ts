import { Controller, Get } from '@nestjs/common';

@Controller('reports')
export class ReportsController {
  @Get()
  getStatus(): { module: string; message: string } {
    return { module: 'reports', message: 'Módulo reports funcionando' };
  }
}
