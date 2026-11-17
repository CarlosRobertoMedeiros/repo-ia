import { Body, Controller, Post } from '@nestjs/common';
import { CreateTransaction, type CreateTransactionIn } from '@<scope>/transactions';
import { PrismaTransactionRepository } from '../../../apps/backend/src/modules/transactions/transaction.prisma';

@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly transactionRepository: PrismaTransactionRepository,
  ) {}

  @Post('/')
  async create(@Body() body: CreateTransactionIn) {
    const useCase = new CreateTransaction(this.transactionRepository);

    return await useCase.execute(body);
  }
}

