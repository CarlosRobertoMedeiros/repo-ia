import { validateStringValues } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

export class HasLowerCaseRule implements ValidationRule {
  validate(value: unknown): string | null {
    return validateStringValues(value, "has.lower.case", (item) => /[a-z]/.test(item));
  }
}
