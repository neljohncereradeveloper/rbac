import { Inject, Injectable } from '@nestjs/common';
import { TOKENS_CORE } from '@/core/domain/constants';
import { TransactionPort } from '@/core/domain/ports';
import { UserRepository } from '@/features/user-management/domain/repositories';
import {
  USER_ACTIONS,
  USER_MANAGEMENT_TOKENS,
} from '@/features/user-management/domain/constants';

@Injectable()
export class ComboboxUserUseCase {
  constructor(
    @Inject(USER_MANAGEMENT_TOKENS.USER)
    private readonly userRepository: UserRepository,
    @Inject(TOKENS_CORE.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
  ) {}

  async execute(): Promise<{ value: string; label: string }[]> {
    return this.transactionHelper.executeTransaction(
      USER_ACTIONS.COMBOBOX,
      async (manager) => {
        const users = await this.userRepository.combobox(manager);
        return users.map((user: { username: string; email: string }) => ({
          value: user.username || '',
          label: user.username
            ? `${user.username}${user.email ? ` (${user.email})` : ''}`
            : '',
        }));
      },
    );
  }
}
