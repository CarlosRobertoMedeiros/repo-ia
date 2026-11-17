import { validateDateValues } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

export class PastDateRule implements ValidationRule {
  validate(value: unknown): string | null {
    return validateDateValues(
      value,
      "past.date",
      (item) => item.getTime() < Date.now(),
    );
  }
}
