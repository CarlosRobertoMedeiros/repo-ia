import { validateStringValues } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

function isValidDateParts(year: number, month: number, day: number): boolean {
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function isValidIsoDateString(value: string): boolean {
  const dateOnlyMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (dateOnlyMatch !== null) {
    const [, year, month, day] = dateOnlyMatch;

    return isValidDateParts(Number(year), Number(month), Number(day));
  }

  const dateTimeMatch = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})?$/,
  );

  if (dateTimeMatch === null) {
    return false;
  }

  const [, year, month, day, hour, minute, second = "0", , timezone] =
    dateTimeMatch;
  const timezoneMatch =
    timezone?.match(/^([+-])(\d{2}):(\d{2})$/) ?? null;

  if (
    !isValidDateParts(Number(year), Number(month), Number(day)) ||
    Number(hour) > 23 ||
    Number(minute) > 59 ||
    Number(second) > 59
  ) {
    return false;
  }

  if (timezoneMatch === null) {
    return true;
  }

  const [, , timezoneHours, timezoneMinutes] = timezoneMatch;

  return Number(timezoneHours) <= 23 && Number(timezoneMinutes) <= 59;
}

export class DateStringRule implements ValidationRule {
  validate(value: unknown): string | null {
    return validateStringValues(
      value,
      "date.string",
      (item) => isValidIsoDateString(item),
    );
  }
}
