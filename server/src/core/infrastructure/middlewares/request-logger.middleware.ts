import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, headers, ip, query, body } = req; // Extract data from the request
    const user_agent = headers['user-agent'] || 'Unknown';
    const start_time = Date.now();

    res.on('finish', () => {
      const response_time = Date.now() - start_time;
      const { statusCode: status_code } = res;

      // Log the request details
      this.logger.log(
        `Method: ${method}, URL: ${originalUrl}, Status: ${status_code}, Time: ${response_time}ms, IP: ${ip}, User-Agent: ${user_agent}, Query: ${JSON.stringify(
          query,
        )}, Body: ${JSON.stringify(body)}`,
      );
    });

    next();
  }
}
