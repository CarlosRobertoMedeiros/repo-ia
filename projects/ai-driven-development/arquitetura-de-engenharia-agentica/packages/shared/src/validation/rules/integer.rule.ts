import { validateNumberValues } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

export class IntegerRule implements ValidationRule {
  validate(value: unknown): string | null {
    return validateNumberValues(value, "integer", (item) => Number.isInteger(item));
  }
}
