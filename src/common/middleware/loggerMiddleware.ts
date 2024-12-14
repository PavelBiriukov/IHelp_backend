import { Injectable, Logger, NestMiddleware } from '@nestjs/common';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(request: Express.Request, response: Express.Response, next: Express.NextFunction): void {
    const { method, originalUrl } = request;
    const { statusCode } = response;

    const log = `${originalUrl} ${method} ${statusCode}`;

    response.on('finish', () => {
      this.logger.log(log);
    });

    next();
  }
}
