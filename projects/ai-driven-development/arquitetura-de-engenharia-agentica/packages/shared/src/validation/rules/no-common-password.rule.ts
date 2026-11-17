import { validateStringValues } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

const COMMON_PASSWORDS = new Set([
  "123456",
  "123456789",
  "12345678",
  "12345",
  "password",
  "qwerty",
  "abc123",
  "111111",
]);

export class NoCommonPasswordRule implements ValidationRule {
  readonly blacklist: Set<string>;

  constructor(blacklist: Iterable<string> = COMMON_PASSWORDS) {
    this.blacklist = new Set(
      Array.from(blacklist, (item) => item.trim().toLowerCase()),
    );
  }

  validate(value: unknown): string | null {
    return validateStringValues(
      value,
      "no.common.password",
      (item) => !this.blacklist.has(item.trim().toLowerCase()),
    );
  }
}
