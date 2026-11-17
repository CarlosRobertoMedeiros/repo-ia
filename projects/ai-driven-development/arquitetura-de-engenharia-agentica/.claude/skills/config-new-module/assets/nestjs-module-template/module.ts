import { Module } from '@nestjs/common';
import { __MODULE_CLASS_NAME__Controller } from './__MODULE_NAME__.controller';

@Module({
  controllers: [__MODULE_CLASS_NAME__Controller],
})
export class __MODULE_CLASS_NAME__Module {}
