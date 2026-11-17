import { validateDateValues } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

export class FutureDateRule implements ValidationRule {
  validate(value: unknown): string | null {
    return validateDateValues(
      value,
      "future.date",
      (item) => item.getTime() > Date.now(),
    );
  }
}
