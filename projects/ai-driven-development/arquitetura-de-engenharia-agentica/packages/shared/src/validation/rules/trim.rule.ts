import { validateStringValues } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

export class TrimRule implements ValidationRule {
  validate(value: unknown): string | null {
    return validateStringValues(value, "trim", (item) => item.trim() === item);
  }
}
