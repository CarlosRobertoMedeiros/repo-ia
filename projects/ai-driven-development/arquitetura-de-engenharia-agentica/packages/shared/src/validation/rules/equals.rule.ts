import { getComparableKey, validateEachValue } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

export class EqualsRule implements ValidationRule {
  constructor(readonly expectedValue: unknown) {}

  validate(value: unknown): string | null {
    return validateEachValue(
      value,
      "equals",
      (item) => getComparableKey(item) === getComparableKey(this.expectedValue),
    );
  }
}
