import { validateNumberValues } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

export class RangeValueRule implements ValidationRule {
  constructor(
    readonly min: number,
    readonly max: number,
  ) {}

  validate(value: unknown): string | null {
    return validateNumberValues(
      value,
      "range.value",
      (item) => item >= this.min && item <= this.max,
    );
  }
}
