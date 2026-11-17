import { getComparableKey, validateEachValue } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

export class NotInRule implements ValidationRule {
  readonly blockedValues: Set<string>;

  constructor(values: readonly unknown[]) {
    this.blockedValues = new Set(values.map((item) => getComparableKey(item)));
  }

  validate(value: unknown): string | null {
    return validateEachValue(
      value,
      "not.in",
      (item) => !this.blockedValues.has(getComparableKey(item)),
    );
  }
}
