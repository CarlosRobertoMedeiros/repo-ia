import { isEmptyValue, toValidDate } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

export class AgeRule implements ValidationRule {
  constructor(
    readonly min: number,
    readonly max: number,
  ) {}

  validate(value: unknown): string | null {
    if (isEmptyValue(value)) {
      return null;
    }

    const birthDate = toValidDate(value);

    if (birthDate === null) {
      return "age.range";
    }

    const age = this.getAgeFromBirthDate(birthDate);

    return age >= this.min && age <= this.max ? null : "age.range";
  }

  private getAgeFromBirthDate(
    birthDate: Date,
    referenceDate = new Date(),
  ): number {
    let age = referenceDate.getFullYear() - birthDate.getFullYear();
    const monthDifference = referenceDate.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && referenceDate.getDate() < birthDate.getDate())
    ) {
      age -= 1;
    }

    return age;
  }
}
