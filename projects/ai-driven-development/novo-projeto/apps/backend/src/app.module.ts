import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule } from '@nestjs/config';
import { ReportsModule } from './modules/reports/reports.module.js';
import { AuthModule } from './modules/auth/auth.module.js';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        ReportsModule,
        AuthModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
