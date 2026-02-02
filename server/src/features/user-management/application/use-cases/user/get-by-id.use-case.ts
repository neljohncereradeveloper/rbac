import { Inject, Injectable } from '@nestjs/common';
import { TOKENS_CORE } from '@/core/domain/constants';
import { TransactionPort } from '@/core/domain/ports';
import { UserRepository } from '@/features/user-management/domain/repositories';
import {
  USER_ACTIONS,
  USER_MANAGEMENT_TOKENS,
} from '@/features/user-management/domain/constants';
import { User } from '@/features/user-management/domain/models';
import { HTTP_STATUS } from '@/core/domain/constants';
import { UserBusinessException } from '@/features/user-management/domain/exceptions';

@Injectable()
export class GetUserByIdUseCase {
  constructor(
    @Inject(USER_MANAGEMENT_TOKENS.USER)
    private readonly userRepository: UserRepository,
    @Inject(TOKENS_CORE.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
  ) {}

  async execute(id: number): Promise<User> {
    return this.transactionHelper.executeTransaction(
      USER_ACTIONS.PAGINATED_LIST,
      async (manager) => {
        const user = await this.userRepository.findById(id, manager);
        if (!user) {
          throw new UserBusinessException(
            `User with ID ${id} not found.`,
            HTTP_STATUS.NOT_FOUND,
          );
        }
        return user;
      },
    );
  }
}
