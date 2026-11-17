import { validateStringValues } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

export class HasUpperCaseRule implements ValidationRule {
  validate(value: unknown): string | null {
    return validateStringValues(value, "has.upper.case", (item) => /[A-Z]/.test(item));
  }
}
