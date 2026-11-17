import { validateStringValues } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export class UrlRule implements ValidationRule {
  validate(value: unknown): string | null {
    return validateStringValues(value, "url", (item) => isValidUrl(item));
  }
}
