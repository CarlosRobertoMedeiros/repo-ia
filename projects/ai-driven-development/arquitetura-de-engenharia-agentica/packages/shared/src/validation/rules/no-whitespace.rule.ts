import { validateStringValues } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

export class NoWhitespaceRule implements ValidationRule {
  validate(value: unknown): string | null {
    return validateStringValues(value, "no.whitespace", (item) => !/\s/.test(item));
  }
}
