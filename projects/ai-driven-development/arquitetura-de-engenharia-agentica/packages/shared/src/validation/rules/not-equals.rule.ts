import { getComparableKey, validateEachValue } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

export class NotEqualsRule implements ValidationRule {
  constructor(readonly blockedValue: unknown) {}

  validate(value: unknown): string | null {
    return validateEachValue(
      value,
      "not.equals",
      (item) => getComparableKey(item) !== getComparableKey(this.blockedValue),
    );
  }
}
