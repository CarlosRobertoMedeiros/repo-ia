import { validateStringValues } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

export class HasSpecialCharRule implements ValidationRule {
  validate(value: unknown): string | null {
    return validateStringValues(
      value,
      "has.special.char",
      (item) => /[^A-Za-z0-9]/.test(item),
    );
  }
}
