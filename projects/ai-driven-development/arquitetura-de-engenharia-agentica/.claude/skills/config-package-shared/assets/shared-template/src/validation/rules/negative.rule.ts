import { validateNumberValues } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

export class NegativeRule implements ValidationRule {
  validate(value: unknown): string | null {
    return validateNumberValues(value, "negative", (item) => item < 0);
  }
}
