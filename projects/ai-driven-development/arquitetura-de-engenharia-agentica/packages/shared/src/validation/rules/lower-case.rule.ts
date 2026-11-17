import { validateStringValues } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

const LOWER_CASE_REGEX = /^[a-z]+$/;

export class LowerCaseRule implements ValidationRule {
  validate(value: unknown): string | null {
    return validateStringValues(
      value,
      "lower.case",
      (item) => LOWER_CASE_REGEX.test(item),
    );
  }
}
