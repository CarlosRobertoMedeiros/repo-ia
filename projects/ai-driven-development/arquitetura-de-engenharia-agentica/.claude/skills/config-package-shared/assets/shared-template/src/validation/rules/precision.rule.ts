import { validateNumberValues } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

function countDecimalPlaces(value: number): number {
  const [mantissa, exponentPart] = value.toString().toLowerCase().split("e");
  const exponent = exponentPart === undefined ? 0 : Number(exponentPart);
  const decimalPart = mantissa!.split(".")[1];
  const decimalLength = decimalPart === undefined ? 0 : decimalPart.length;
  const precision = decimalLength - exponent;

  return precision > 0 ? precision : 0;
}

export class PrecisionRule implements ValidationRule {
  constructor(readonly maxDecimals: number) {}

  validate(value: unknown): string | null {
    return validateNumberValues(
      value,
      "precision",
      (item) => countDecimalPlaces(item) <= this.maxDecimals,
    );
  }
}
