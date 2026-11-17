import { testPattern, validateStringValues } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

export class RegexRule implements ValidationRule {
  readonly pattern: RegExp;

  constructor(pattern: RegExp | string) {
    this.pattern = typeof pattern === "string" ? new RegExp(pattern) : pattern;
  }

  validate(value: unknown): string | null {
    return validateStringValues(
      value,
      "regex",
      (item) => testPattern(this.pattern, item),
    );
  }
}
