import { isEmptyValue, toValidDate } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

export class DateRule implements ValidationRule {
  validate(value: unknown): string | null {
    if (isEmptyValue(value)) {
      return null;
    }

    return toValidDate(value) !== null ? null : "invalid.date";
  }
}
