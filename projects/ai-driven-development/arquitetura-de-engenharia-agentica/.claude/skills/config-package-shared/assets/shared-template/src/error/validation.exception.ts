import { DomainError } from "./domain.error";
import { ValidationError } from "./validation.error";

export class ValidationException extends DomainError {
  constructor(
    readonly errors: ValidationError[],
    message = "Validation failed",
  ) {
    super(message, 422);
  }
}
