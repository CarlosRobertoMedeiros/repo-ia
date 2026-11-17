import { testPattern, validateStringValues } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

const E164_PHONE_REGEX = /^\+[1-9]\d{1,14}$/;

export class PhoneRule implements ValidationRule {
  readonly pattern: RegExp;

  constructor(pattern: RegExp = E164_PHONE_REGEX) {
    this.pattern = pattern;
  }

  validate(value: unknown): string | null {
    return validateStringValues(
      value,
      "phone",
      (item) => testPattern(this.pattern, item),
    );
  }
}
