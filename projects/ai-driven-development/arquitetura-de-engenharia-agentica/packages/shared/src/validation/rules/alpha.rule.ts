import { validateStringValues } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

const ALPHA_REGEX = /^[A-Za-z]+$/;

export class AlphaRule implements ValidationRule {
  validate(value: unknown): string | null {
    return validateStringValues(value, "alpha", (item) => ALPHA_REGEX.test(item));
  }
}
