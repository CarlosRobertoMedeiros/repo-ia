import { validateStringValues } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

const HEX_COLOR_REGEX = /^#(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

export class HexColorRule implements ValidationRule {
  validate(value: unknown): string | null {
    return validateStringValues(
      value,
      "hex.color",
      (item) => HEX_COLOR_REGEX.test(item),
    );
  }
}
