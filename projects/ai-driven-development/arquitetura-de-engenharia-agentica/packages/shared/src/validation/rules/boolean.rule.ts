import { ValidationRule } from "../validation-rule.interface";

/** Aceita apenas `true`/`false`. Valores ausentes (null/undefined) passam: combine com RequiredRule quando o campo for obrigatorio. */
export class BooleanRule implements ValidationRule {
  validate(value: unknown): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    return typeof value === "boolean" ? null : "boolean";
  }
}
