import { getValueLength, isEmptyValue } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

export class MaxLengthRule implements ValidationRule {
  constructor(readonly max: number) {}

  validate(value: unknown): string | null {
    if (isEmptyValue(value)) {
      return null;
    }

    const length = getValueLength(value);

    return length !== null && length <= this.max ? null : "max.length";
  }
}
