import { isEmptyValue } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

export class MinItemsRule implements ValidationRule {
  constructor(readonly min: number) {}

  validate(value: unknown): string | null {
    if (isEmptyValue(value)) {
      return null;
    }

    return Array.isArray(value) && value.length >= this.min ? null : "min.items";
  }
}
