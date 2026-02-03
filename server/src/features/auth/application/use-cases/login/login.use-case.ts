import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '@/features/user-management/domain/repositories';
import { USER_MANAGEMENT_TOKENS } from '@/features/user-management/domain/constants';
import { PasswordUtil } from '@/core/utils/password.util';
import { LoginCommand } from '../../commands/login/login.command';
import { JwtPayload } from '@/core/domain/models';
import { JwtTokenPort } from '@/core/domain/ports';
import { TransactionPort } from '@/core/domain/ports';
import { TOKENS_CORE } from '@/core/domain/constants';
import { USER_ACTIONS } from '@/features/user-management/domain/constants';

/**
 * Login Use Case
 * Authenticates user and returns JWT token
 */
@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_MANAGEMENT_TOKENS.USER)
    private readonly userRepository: UserRepository,
    @Inject(TOKENS_CORE.JWT)
    private readonly jwtTokenService: JwtTokenPort,
    @Inject(TOKENS_CORE.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
  ) { }

  async execute(command: LoginCommand): Promise<{
    access_token: string;
    user: {
      id: number;
      username: string;
      email: string;
      first_name: string | null;
      middle_name: string | null;
      last_name: string | null;
      phone: string | null;
      date_of_birth: Date | null;
    };
  }> {
    return this.transactionHelper.executeTransaction(
      USER_ACTIONS.LOGIN,
      async (manager) => {
        // Normalize input (trim and lowercase)
        // Usernames are stored lowercase (from DTO sanitize), emails are also lowercase
        const normalizedInput = command.username_or_email.trim().toLowerCase();

        // Try to find user by username first (usernames are stored lowercase)
        let user = await this.userRepository.findByUsername(
          normalizedInput,
          manager,
        );

        // If not found by username, try email
        if (!user) {
          user = await this.userRepository.findByEmail(normalizedInput, manager);
        }

        // Check if user exists
        if (!user) {
          throw new UnauthorizedException('Invalid credentials');
        }

        // Check if user is archived
        if (user.deleted_at) {
          throw new UnauthorizedException('User account is archived');
        }

        // Check if user is active
        if (!user.is_active) {
          throw new UnauthorizedException('User account is inactive');
        }

        // Check if password is set
        if (!user.password) {
          throw new UnauthorizedException('Password not set for this account');
        }

        // Verify password
        const isPasswordValid = await PasswordUtil.verify(
          command.password,
          user.password,
        );

        if (!isPasswordValid) {
          throw new UnauthorizedException('Invalid credentials');
        }

        // Create JWT payload
        const payload: JwtPayload = {
          sub: user.id!,
          username: user.username,
          email: user.email,
        };

        // Generate JWT token
        const access_token = this.jwtTokenService.sign(payload);

        // Return token and user info (without password)
        return {
          access_token,
          user: {
            id: user.id!,
            username: user.username,
            email: user.email,
            first_name: user.first_name,
            middle_name: user.middle_name,
            last_name: user.last_name,
            phone: user.phone,
            date_of_birth: user.date_of_birth,
          },
        };
      },
    );
  }
}
