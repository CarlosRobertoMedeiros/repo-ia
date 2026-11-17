import { validateNumberValues } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

export class MinValueRule implements ValidationRule {
  constructor(readonly min: number) {}

  validate(value: unknown): string | null {
    return validateNumberValues(value, "min.value", (item) => item >= this.min);
  }
}
