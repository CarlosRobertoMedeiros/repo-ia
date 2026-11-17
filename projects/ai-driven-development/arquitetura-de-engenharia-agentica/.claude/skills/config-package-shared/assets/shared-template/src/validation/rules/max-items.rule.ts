import { isEmptyValue } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

export class MaxItemsRule implements ValidationRule {
  constructor(readonly max: number) {}

  validate(value: unknown): string | null {
    if (isEmptyValue(value)) {
      return null;
    }

    return Array.isArray(value) && value.length <= this.max ? null : "max.items";
  }
}
