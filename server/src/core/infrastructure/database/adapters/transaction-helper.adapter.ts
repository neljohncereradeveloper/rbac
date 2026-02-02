import {
  CheckConstraintViolationException,
  ForeignKeyViolationException,
  NotNullViolationException,
  SerializationFailureException,
  UniqueConstraintException,
} from '@/core/domain/exceptions/database';
import { InternalDatabaseErrorException } from '@/core/domain/exceptions/database/internal-database.exception';
import { TransactionPort } from '@/core/domain/ports';
import { Injectable, Logger } from '@nestjs/common';
import {
  DataSource,
  EntityManager,
  QueryRunner,
  QueryFailedError,
} from 'typeorm';

@Injectable()
export class TransactionAdapter implements TransactionPort {
  constructor(private readonly data_source: DataSource) {}

  async executeTransaction<T>(
    action_log: string,
    operation: (manager: EntityManager) => Promise<T>,
  ): Promise<T> {
    const logger = new Logger(action_log);
    const query_runner: QueryRunner = this.data_source.createQueryRunner();
    let is_transaction_active = false;

    try {
      await query_runner.connect();
      await query_runner.startTransaction();
      is_transaction_active = true;
      logger.debug('Starting new transaction.');

      const result = await operation(query_runner.manager);
      await query_runner.commitTransaction();
      is_transaction_active = false;
      logger.debug('Transaction committed successfully.');
      return result;
    } catch (error) {
      // Rollback transaction if it's still active
      if (is_transaction_active && query_runner.isTransactionActive) {
        try {
          await query_runner.rollbackTransaction();
          logger.debug('Transaction rolled back successfully.');
        } catch (rollback_error) {
          logger.error(
            'Failed to rollback transaction.',
            rollback_error instanceof Error
              ? rollback_error.stack
              : rollback_error,
          );
          // Log but don't throw - we want to throw the original error
        }
      }

      // Enhanced error logging
      logger.error(
        `Transaction failed for action: ${action_log}`,
        error instanceof Error ? error.stack : String(error),
      );

      // Handle PostgreSQL-specific errors
      if (error instanceof QueryFailedError) {
        const error_message = error.message;
        const error_code = (error as any).code; // PostgreSQL error codes

        logger.error('Database query failed.', {
          message: error_message,
          code: error_code,
          query: (error as any).query,
        });

        // PostgreSQL-specific error handling
        if (error_code) {
          // Handle common PostgreSQL error codes
          switch (error_code) {
            case '23505': // Unique violation
              throw new UniqueConstraintException();
            case '23503': // Foreign key violation
              throw new ForeignKeyViolationException();
            case '23502': // Not null violation
              throw new NotNullViolationException();
            case '23514': // Check constraint violation
              throw new CheckConstraintViolationException();
            case '40001': // Serialization failure (deadlock)
              throw new SerializationFailureException();
            default:
              throw new InternalDatabaseErrorException();
          }
        } else {
          throw new InternalDatabaseErrorException();
        }
      }

      // Re-throw the original error for other error types
      throw error;
    } finally {
      // Always release the query runner, even if rollback failed
      try {
        if (query_runner.isReleased === false) {
          await query_runner.release();
          logger.debug('Transaction resources released.');
        }
      } catch (release_error) {
        logger.error(
          'Failed to release query runner.',
          release_error instanceof Error
            ? release_error.stack
            : String(release_error),
        );
        // Don't throw - this is cleanup
      }
    }
  }
}
