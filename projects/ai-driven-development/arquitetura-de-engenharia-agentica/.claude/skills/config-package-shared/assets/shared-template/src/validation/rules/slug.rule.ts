import { validateStringValues } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class SlugRule implements ValidationRule {
  validate(value: unknown): string | null {
    return validateStringValues(value, "slug", (item) => SLUG_REGEX.test(item));
  }
}
