import { validateStringValues } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

const TIME_REGEX = /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/;

export class TimeStringRule implements ValidationRule {
  validate(value: unknown): string | null {
    return validateStringValues(
      value,
      "time.string",
      (item) => TIME_REGEX.test(item),
    );
  }
}
