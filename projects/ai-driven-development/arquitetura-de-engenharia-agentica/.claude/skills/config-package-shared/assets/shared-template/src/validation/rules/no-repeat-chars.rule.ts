import { validateStringValues } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

export class NoRepeatCharsRule implements ValidationRule {
  readonly pattern: RegExp;

  constructor(maxConsecutiveAllowed = 2) {
    this.pattern = new RegExp(`(.)\\1{${maxConsecutiveAllowed},}`);
  }

  validate(value: unknown): string | null {
    return validateStringValues(
      value,
      "no.repeat.chars",
      (item) => !this.pattern.test(item),
    );
  }
}
