import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ZapModule } from './features/zaps/zap.module';
import { WeekhookModule } from './features/weekhook/weekhook.module';
import { SendMailModule } from './features/send-mail/send-mail.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  addTransactionalDataSource,
  getDataSourceByName,
} from 'typeorm-transactional';
import datasource from './infrastructure/database/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [datasource],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const options = configService.get<TypeOrmModuleOptions>('typeorm');
        if (!options) {
          throw new Error('TypeORM configuration not found');
        }
        return options;
      },
      dataSourceFactory: async (options) => {
        if (!options) {
          throw new Error('TypeORM configuration not found');
        }

        const registeredDataSource = getDataSourceByName('default');
        if (registeredDataSource) {
          return registeredDataSource;
        }

        return addTransactionalDataSource(new DataSource(options));
      },
    }),
    ZapModule,
    WeekhookModule,
    SendMailModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
