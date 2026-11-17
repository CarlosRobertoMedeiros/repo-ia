import { validateStringValues } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

function isValidCpf(value: string): boolean {
  const digits = value.replace(/\D/g, "");

  if (!/^\d{11}$/.test(digits) || /^(\d)\1{10}$/.test(digits)) {
    return false;
  }

  let sum = 0;

  for (let index = 0; index < 9; index += 1) {
    sum += Number(digits[index]) * (10 - index);
  }

  let checkDigit = (sum * 10) % 11;

  if (checkDigit === 10) {
    checkDigit = 0;
  }

  if (checkDigit !== Number(digits[9])) {
    return false;
  }

  sum = 0;

  for (let index = 0; index < 10; index += 1) {
    sum += Number(digits[index]) * (11 - index);
  }

  checkDigit = (sum * 10) % 11;

  if (checkDigit === 10) {
    checkDigit = 0;
  }

  return checkDigit === Number(digits[10]);
}

export class CpfRule implements ValidationRule {
  validate(value: unknown): string | null {
    return validateStringValues(value, "cpf", (item) => isValidCpf(item));
  }
}
