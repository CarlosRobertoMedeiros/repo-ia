import { isEmptyValue } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class EmailRule implements ValidationRule {
  validate(value: unknown): string | null {
    if (isEmptyValue(value)) {
      return null;
    }

    if (typeof value !== "string") {
      return "invalid.email";
    }

    return EMAIL_REGEX.test(value.trim()) ? null : "invalid.email";
  }
}
