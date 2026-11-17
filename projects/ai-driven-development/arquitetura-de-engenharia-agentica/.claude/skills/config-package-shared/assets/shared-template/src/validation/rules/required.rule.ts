import { ValidationRule } from "../validation-rule.interface";
import { isEmptyValue } from "../rule.utils";

export class RequiredRule implements ValidationRule {
  validate(value: unknown): string | null {
    return isEmptyValue(value) ? "required" : null;
  }
}
