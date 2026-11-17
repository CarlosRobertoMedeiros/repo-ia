import { getComparableKey, isEmptyValue } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

export class UniqueItemsRule implements ValidationRule {
  validate(value: unknown): string | null {
    if (isEmptyValue(value)) {
      return null;
    }

    if (!Array.isArray(value)) {
      return "unique.items";
    }

    const keys = value.map((item) => getComparableKey(item));

    return new Set(keys).size === keys.length ? null : "unique.items";
  }
}
