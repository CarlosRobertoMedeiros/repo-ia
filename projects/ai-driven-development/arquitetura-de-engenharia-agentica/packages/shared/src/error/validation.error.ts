import { DomainError } from "./domain.error";

export class ValidationError extends DomainError {
  constructor(readonly message: string) {
    super(message, 422);
  }
}
