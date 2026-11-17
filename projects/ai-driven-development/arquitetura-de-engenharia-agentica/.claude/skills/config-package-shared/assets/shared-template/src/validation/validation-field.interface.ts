import { ValidationRule } from "./validation-rule.interface";

export interface ValidationField {
  code: string;
  value: unknown;
  rules: ValidationRule[];
}
