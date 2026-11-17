import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  DomainError,
  ValidationError,
  ValidationException,
} from '@sdd/shared';
import { ApiErrorResponse } from './error-response.type';

type ErrorShape = Pick<ApiErrorResponse, 'statusCode' | 'errors'> &
  Partial<Pick<ApiErrorResponse, 'message' | 'details'>>;

const UNEXPECTED_ERROR_CODE = 'INTERNAL_SERVER_ERROR';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const shape = this.buildShape(exception);
    const body: ApiErrorResponse = {
      ...shape,
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    if (body.statusCode >= 500) {
      this.logger.error(body.errors.join(', '), (exception as Error)?.stack);
    }

    response.status(body.statusCode).json(body);
  }

  private buildShape(exception: unknown): ErrorShape {
    if (exception instanceof ValidationException) {
      return {
        statusCode: exception.statusCode,
        errors: exception.errors.map((err) => err.message),
        message: exception.message,
      };
    }

    if (exception instanceof ValidationError) {
      return {
        statusCode: exception.statusCode,
        errors: [exception.message],
      };
    }

    if (exception instanceof DomainError) {
      return {
        statusCode: exception.statusCode,
        errors: [exception.message],
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      return {
        statusCode: status,
        errors: this.extractHttpErrors(res, exception.message),
        details: typeof res === 'object' ? res : undefined,
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      errors: [UNEXPECTED_ERROR_CODE],
    };
  }

  private extractHttpErrors(
    response: string | object,
    fallback: string,
  ): string[] {
    if (typeof response === 'string') return [response];
    const message = (response as { message?: string | string[] }).message;
    if (Array.isArray(message)) return message;
    if (typeof message === 'string') return [message];
    return [fallback];
  }
}
