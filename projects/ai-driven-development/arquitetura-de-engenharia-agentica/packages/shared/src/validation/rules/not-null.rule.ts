import { ValidationRule } from "../validation-rule.interface";

export class NotNullRule implements ValidationRule {
  validate(value: unknown): string | null {
    return value === null ? "not.null" : null;
  }
}
