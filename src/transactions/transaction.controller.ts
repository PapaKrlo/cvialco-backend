import { Controller, Get, Query, ParseIntPipe, DefaultValuePipe, UsePipes, ValidationPipe, Optional, Param } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionPreviewDto } from './dto/transaction-preview.dto';
import { TransactionDetailDto } from './dto/transaction-detail.dto';
import { Transform, Type } from 'class-transformer';
import { IsOptional, IsDate, IsInt, Min } from 'class-validator';

class GetTransactionsQueryDto {
    @IsInt()
    @Type(() => Number)
    contractId: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    limit?: number;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    startDate?: Date;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    endDate?: Date;
}

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  async getTransactions(
    @Query() query: GetTransactionsQueryDto
  ): Promise<TransactionPreviewDto[]> {
    console.log(`Request received for /transactions:`, query);
    return this.transactionService.getTransactions(
      query.contractId, 
      query.limit, 
      query.startDate, 
      query.endDate
    );
  }

  @Get('detail/:id')
  async getTransactionDetail(
    @Param('id', ParseIntPipe) id: number
  ): Promise<TransactionDetailDto> {
    console.log(`Request received for /transactions/detail/${id}`);
    return this.transactionService.getTransactionDetail(id);
  }
} 