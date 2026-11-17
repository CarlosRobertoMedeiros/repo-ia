import { validateStringValues } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

const RG_REGEX = /^\d{1,2}\.?\d{3}\.?\d{3}-?[\dXx]$/;

export class RgRule implements ValidationRule {
  validate(value: unknown): string | null {
    return validateStringValues(value, "rg", (item) => RG_REGEX.test(item));
  }
}
