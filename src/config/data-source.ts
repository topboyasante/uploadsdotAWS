import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { config as LoadConfig } from 'dotenv';
import { AppConfig } from './config';

// Load environment variables from .env file
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
LoadConfig();

const config = AppConfig();
const configService = new ConfigService(config);

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: configService.get<string>('database.url'),
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['src/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: true,
});
