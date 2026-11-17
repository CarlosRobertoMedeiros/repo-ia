import { validateStringValues } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class UuidRule implements ValidationRule {
  validate(value: unknown): string | null {
    return validateStringValues(value, "uuid", (item) => UUID_V4_REGEX.test(item));
  }
}
