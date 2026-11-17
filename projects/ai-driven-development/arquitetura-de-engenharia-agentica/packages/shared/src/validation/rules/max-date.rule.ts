import { toValidDate, validateDateValues } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

export class MaxDateRule implements ValidationRule {
  readonly maxTime: number;

  constructor(maxDate: Date | number | string) {
    this.maxTime = toValidDate(maxDate)?.getTime() ?? Number.NaN;
  }

  validate(value: unknown): string | null {
    return validateDateValues(
      value,
      "max.date",
      (item) => item.getTime() <= this.maxTime,
    );
  }
}
