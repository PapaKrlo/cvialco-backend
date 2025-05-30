import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ContractModule } from './contracts/contract.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [AuthModule, ContractModule, TransactionsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
