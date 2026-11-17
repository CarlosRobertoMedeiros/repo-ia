import { validateStringValues } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

function calculateDigit(baseDigits: string, weights: number[]): number {
  const sum = baseDigits
    .split("")
    .reduce(
      (total, digit, index) => total + Number(digit) * weights[index]!,
      0,
    );
  const remainder = sum % 11;

  return remainder < 2 ? 0 : 11 - remainder;
}

function isValidCnpj(value: string): boolean {
  const digits = value.replace(/\D/g, "");

  if (!/^\d{14}$/.test(digits) || /^(\d)\1{13}$/.test(digits)) {
    return false;
  }

  const weightsForFirstDigit = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weightsForSecondDigit = [6, ...weightsForFirstDigit];
  const firstDigit = calculateDigit(digits.slice(0, 12), weightsForFirstDigit);
  const secondDigit = calculateDigit(
    `${digits.slice(0, 12)}${firstDigit}`,
    weightsForSecondDigit,
  );

  return (
    firstDigit === Number(digits[12]) && secondDigit === Number(digits[13])
  );
}

export class CnpjRule implements ValidationRule {
  validate(value: unknown): string | null {
    return validateStringValues(value, "cnpj", (item) => isValidCnpj(item));
  }
}
