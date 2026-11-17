import { validateStringValues } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

export class JsonStringRule implements ValidationRule {
  validate(value: unknown): string | null {
    return validateStringValues(value, "json.string", (item) => {
      try {
        JSON.parse(item);

        return true;
      } catch {
        return false;
      }
    });
  }
}
