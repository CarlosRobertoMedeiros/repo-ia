import { validateStringValues } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

const ALPHA_NUMERIC_REGEX = /^[A-Za-z0-9]+$/;

export class AlphaNumericRule implements ValidationRule {
  validate(value: unknown): string | null {
    return validateStringValues(
      value,
      "alpha.numeric",
      (item) => ALPHA_NUMERIC_REGEX.test(item),
    );
  }
}
