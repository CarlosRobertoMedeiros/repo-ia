import { Controller, Get } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Get()
  getStatus(): { module: string; message: string } {
    return { module: 'auth', message: 'Módulo auth funcionando' };
  }
}
