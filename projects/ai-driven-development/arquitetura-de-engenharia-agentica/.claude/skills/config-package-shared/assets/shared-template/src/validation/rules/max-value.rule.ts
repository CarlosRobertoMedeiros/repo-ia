import { validateNumberValues } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

export class MaxValueRule implements ValidationRule {
  constructor(readonly max: number) {}

  validate(value: unknown): string | null {
    return validateNumberValues(value, "max.value", (item) => item <= this.max);
  }
}
