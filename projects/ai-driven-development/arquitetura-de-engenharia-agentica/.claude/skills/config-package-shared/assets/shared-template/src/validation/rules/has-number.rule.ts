import { validateStringValues } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

export class HasNumberRule implements ValidationRule {
  validate(value: unknown): string | null {
    return validateStringValues(value, "has.number", (item) => /\d/.test(item));
  }
}
