import { validateStringValues } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

export class ContainsRule implements ValidationRule {
  constructor(readonly substring: string) {}

  validate(value: unknown): string | null {
    return validateStringValues(
      value,
      "contains",
      (item) => item.includes(this.substring),
    );
  }
}
