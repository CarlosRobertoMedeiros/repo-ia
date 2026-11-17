import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ListMyTransactions,
  type ListMyTransactionsIn,
} from '@<scope>/transactions';
import { JwtAuthGuard } from '../../../apps/backend/src/shared/auth/jwt-auth.guard';
import { CurrentUser } from '../../../apps/backend/src/shared/decorators/current-user.decorator';
import { PrismaTransactionRepository } from '../../../apps/backend/src/modules/transactions/transaction.prisma';

type ListMyTransactionsHttpQuery = {
  page?: number;
  perPage?: number;
};

@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly transactionRepository: PrismaTransactionRepository,
  ) {}

  @Get('/me')
  @UseGuards(JwtAuthGuard)
  async listMine(
    @CurrentUser('id') userId: string,
    @Query() query: ListMyTransactionsHttpQuery,
  ) {
    const useCase = new ListMyTransactions(this.transactionRepository);

    const input: ListMyTransactionsIn = {
      ...query,
      userId,
    };

    return await useCase.execute(input);
  }
}

