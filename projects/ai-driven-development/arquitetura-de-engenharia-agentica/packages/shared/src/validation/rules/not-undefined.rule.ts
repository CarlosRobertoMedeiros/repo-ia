import { ValidationRule } from "../validation-rule.interface";

export class NotUndefinedRule implements ValidationRule {
  validate(value: unknown): string | null {
    return value === undefined ? "not.undefined" : null;
  }
}
