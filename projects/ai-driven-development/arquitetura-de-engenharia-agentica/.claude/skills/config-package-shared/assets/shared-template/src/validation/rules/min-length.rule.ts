import { getValueLength, isEmptyValue } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

export class MinLengthRule implements ValidationRule {
  constructor(readonly min: number) {}

  validate(value: unknown): string | null {
    if (isEmptyValue(value)) {
      return null;
    }

    const length = getValueLength(value);

    return length !== null && length >= this.min ? null : "min.length";
  }
}
