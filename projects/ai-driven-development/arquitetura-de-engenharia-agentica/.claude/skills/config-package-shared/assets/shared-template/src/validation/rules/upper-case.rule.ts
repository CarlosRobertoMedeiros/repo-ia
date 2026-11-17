import { validateStringValues } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

const UPPER_CASE_REGEX = /^[A-Z]+$/;

export class UpperCaseRule implements ValidationRule {
  validate(value: unknown): string | null {
    return validateStringValues(
      value,
      "upper.case",
      (item) => UPPER_CASE_REGEX.test(item),
    );
  }
}
