import { validateNumberValues } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

export class PositiveRule implements ValidationRule {
  validate(value: unknown): string | null {
    return validateNumberValues(value, "positive", (item) => item > 0);
  }
}
