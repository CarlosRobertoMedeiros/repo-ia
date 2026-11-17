import { validateStringValues } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

export class StartsWithRule implements ValidationRule {
  constructor(readonly prefix: string) {}

  validate(value: unknown): string | null {
    return validateStringValues(
      value,
      "starts.with",
      (item) => item.startsWith(this.prefix),
    );
  }
}
