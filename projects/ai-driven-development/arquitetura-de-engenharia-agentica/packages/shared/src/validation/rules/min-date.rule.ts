import { toValidDate, validateDateValues } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

export class MinDateRule implements ValidationRule {
  readonly minTime: number;

  constructor(minDate: Date | number | string) {
    this.minTime = toValidDate(minDate)?.getTime() ?? Number.NaN;
  }

  validate(value: unknown): string | null {
    return validateDateValues(
      value,
      "min.date",
      (item) => item.getTime() >= this.minTime,
    );
  }
}
