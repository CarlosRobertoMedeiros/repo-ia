export function isEmptyValue(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === "string") {
    return value.trim().length === 0;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  return false;
}

export function getValueLength(value: unknown): number | null {
  if (typeof value === "string" || Array.isArray(value)) {
    return value.length;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "length" in value &&
    typeof value.length === "number"
  ) {
    return value.length;
  }

  return null;
}

export function toValidDate(value: unknown): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value !== "string" && typeof value !== "number") {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeRuleValues(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [value];
}

export function validateEachValue(
  value: unknown,
  errorCode: string,
  predicate: (item: unknown) => boolean,
): string | null {
  if (isEmptyValue(value)) {
    return null;
  }

  return normalizeRuleValues(value).every(predicate) ? null : errorCode;
}

export function validateStringValues(
  value: unknown,
  errorCode: string,
  predicate: (item: string) => boolean,
): string | null {
  return validateEachValue(
    value,
    errorCode,
    (item) => typeof item === "string" && predicate(item),
  );
}

export function validateNumberValues(
  value: unknown,
  errorCode: string,
  predicate: (item: number) => boolean,
): string | null {
  return validateEachValue(
    value,
    errorCode,
    (item) => typeof item === "number" && Number.isFinite(item) && predicate(item),
  );
}

export function validateDateValues(
  value: unknown,
  errorCode: string,
  predicate: (item: Date) => boolean,
): string | null {
  return validateEachValue(value, errorCode, (item) => {
    const date = toValidDate(item);

    return date !== null && predicate(date);
  });
}

export function testPattern(pattern: RegExp, value: string): boolean {
  pattern.lastIndex = 0;

  return pattern.test(value);
}

export function getComparableKey(value: unknown): string {
  if (value instanceof Date) {
    return `date:${value.toISOString()}`;
  }

  if (typeof value === "number" && Number.isNaN(value)) {
    return "number:NaN";
  }

  if (typeof value === "object" && value !== null) {
    try {
      return `object:${JSON.stringify(value)}`;
    } catch {
      return `object:${String(value)}`;
    }
  }

  return `${typeof value}:${String(value)}`;
}
