import { validateStringValues } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

const DOMAIN_REGEX =
  /^(?=.{1,253}$)(?!-)(?:[A-Za-z0-9-]{1,63}\.)+[A-Za-z]{2,63}$/;

function isValidDomain(value: string): boolean {
  if (value.includes("://")) {
    return false;
  }

  return DOMAIN_REGEX.test(value);
}

export class DomainRule implements ValidationRule {
  validate(value: unknown): string | null {
    return validateStringValues(value, "domain", (item) => isValidDomain(item));
  }
}
