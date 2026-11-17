import { validateStringValues } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

export class StrongPasswordRule implements ValidationRule {
  readonly minLength: number;

  constructor(minLength: number = 8) {
    this.minLength = minLength;
  }

  validate(value: unknown): string | null {
    return validateStringValues(value, "strong.password", (item) => {
      return (
        item.length >= this.minLength &&
        /[A-Z]/.test(item) &&
        /[a-z]/.test(item) &&
        /\d/.test(item) &&
        /[^A-Za-z0-9]/.test(item)
      );
    });
  }
}
