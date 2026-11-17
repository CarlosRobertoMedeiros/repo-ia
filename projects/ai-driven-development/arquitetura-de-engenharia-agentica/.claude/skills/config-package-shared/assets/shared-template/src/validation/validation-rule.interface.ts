export interface ValidationRule<T = unknown> {
  validate(value: T): string | null;
}
