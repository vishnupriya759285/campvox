import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  public isConnected = false;

  constructor() {
    super({
      log: ['error', 'warn'],
    });
  }

  async onModuleInit() {
    try {
      const dbUrl = process.env.DATABASE_URL || '';
      if (!dbUrl || dbUrl.includes('YOUR_PASSWORD')) {
        this.logger.warn(
          'Supabase PostgreSQL password not yet configured in DATABASE_URL. Running in-memory resilient state mode. Provide credentials in .env to connect to Supabase PostgreSQL.',
        );
        this.isConnected = false;
        return;
      }
      await this.$connect();
      this.isConnected = true;
      this.logger.log('Connected successfully to PostgreSQL database!');
    } catch (error) {
      this.isConnected = false;
      this.logger.warn(
        `Could not connect to PostgreSQL directly (${error.message}). Active fallback database enabled for smooth operation.`,
      );
    }
  }

  async onModuleDestroy() {
    if (this.isConnected) {
      await this.$disconnect();
    }
  }
}
