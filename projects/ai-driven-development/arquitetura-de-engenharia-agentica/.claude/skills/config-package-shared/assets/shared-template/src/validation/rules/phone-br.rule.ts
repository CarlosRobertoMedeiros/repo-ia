import { validateStringValues } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

function isValidPhoneBr(value: string): boolean {
  let digits = value.replace(/\D/g, "");

  if ((digits.length === 12 || digits.length === 13) && digits.startsWith("55")) {
    digits = digits.slice(2);
  }

  if (!/^\d{10,11}$/.test(digits)) {
    return false;
  }

  const areaCode = Number(digits.slice(0, 2));
  const localNumber = digits.slice(2);

  if (areaCode < 11 || areaCode > 99) {
    return false;
  }

  return localNumber.length === 8
    ? /^[2-9]\d{7}$/.test(localNumber)
    : /^9\d{8}$/.test(localNumber);
}

export class PhoneBrRule implements ValidationRule {
  validate(value: unknown): string | null {
    return validateStringValues(value, "phone.br", (item) => isValidPhoneBr(item));
  }
}
