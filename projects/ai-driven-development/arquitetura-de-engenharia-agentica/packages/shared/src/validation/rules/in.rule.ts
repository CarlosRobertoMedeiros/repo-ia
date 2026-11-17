import { getComparableKey, validateEachValue } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

export class InRule implements ValidationRule {
  readonly allowedValues: Set<string>;

  constructor(values: readonly unknown[]) {
    this.allowedValues = new Set(values.map((item) => getComparableKey(item)));
  }

  validate(value: unknown): string | null {
    return validateEachValue(
      value,
      "in",
      (item) => this.allowedValues.has(getComparableKey(item)),
    );
  }
}
