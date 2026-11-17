import { DomainError } from "./domain.error";

export class UnauthorizedError extends DomainError {
  constructor(message: string) {
    super(message, 401);
  }
}
