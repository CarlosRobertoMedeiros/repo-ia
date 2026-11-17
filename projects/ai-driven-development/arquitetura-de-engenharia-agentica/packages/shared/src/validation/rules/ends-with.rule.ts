import { validateStringValues } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

export class EndsWithRule implements ValidationRule {
  constructor(readonly suffix: string) {}

  validate(value: unknown): string | null {
    return validateStringValues(
      value,
      "ends.with",
      (item) => item.endsWith(this.suffix),
    );
  }
}
