import { Controller, Get } from '@nestjs/common';

@Controller('__MODULE_NAME__')
export class __MODULE_CLASS_NAME__Controller {
  @Get('/')
  get__MODULE_CLASS_NAME__() {
    return { message: '__MODULE_CLASS_NAME__ endpoint' };
  }
}
