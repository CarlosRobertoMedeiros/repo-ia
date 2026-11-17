import { toValidDate, validateDateValues } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

export class DateRangeRule implements ValidationRule {
  readonly minTime: number;
  readonly maxTime: number;

  constructor(
    minDate: Date | number | string,
    maxDate: Date | number | string,
  ) {
    this.minTime = toValidDate(minDate)?.getTime() ?? Number.NaN;
    this.maxTime = toValidDate(maxDate)?.getTime() ?? Number.NaN;
  }

  validate(value: unknown): string | null {
    return validateDateValues(
      value,
      "date.range",
      (item) => item.getTime() >= this.minTime && item.getTime() <= this.maxTime,
    );
  }
}
