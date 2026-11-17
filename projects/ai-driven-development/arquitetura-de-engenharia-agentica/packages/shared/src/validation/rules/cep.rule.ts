import { validateStringValues } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

const CEP_REGEX = /^\d{5}-\d{3}$/;

export class CepRule implements ValidationRule {
  validate(value: unknown): string | null {
    return validateStringValues(value, "cep", (item) => CEP_REGEX.test(item));
  }
}
