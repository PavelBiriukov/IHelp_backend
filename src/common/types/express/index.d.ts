/* eslint-disable @typescript-eslint/no-empty-interface */
import { AnyUserInterface } from '../user.types';

type TRequest = Request
type TResponse = Response

interface Query {
  user?: Record<string, unknown> | AnyUserInterface | undefined;
  statusCode?: number | undefined;
  originalUrl?: string | undefined;
  method?: string;

  get(name: string | 'Content-Type' | 'content-type' | 'Something'): string | undefined
}

declare global {
  namespace Express {
    interface AuthInfo {}
    interface Request extends Query, TRequest {}
    interface Response extends Query, TResponse {
      on(
        event: 'close' | 'drain' | 'error' | 'finish' | 'pipe' | 'unpipe' | string | symbol, 
        listener: (...args: any[]) => void
      ): this;
    }
    interface NextFunction {
      (err?: any): void;
      (deferToNext: "router"): void;
      (deferToNext: "route"): void;
    }
  }
}

export {};
/* eslint-enable @typescript-eslint/no-empty-interface */