import { validateStringValues } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

const PERSON_NAME_PART_PATTERN = "[\\p{L}\\p{M}]+(?:['-][\\p{L}\\p{M}]+)*";
const PERSON_NAME_REGEX = new RegExp(
  `^\\s*${PERSON_NAME_PART_PATTERN}(?:\\s+${PERSON_NAME_PART_PATTERN})+\\s*$`,
  "u",
);

export class PersonNameRule implements ValidationRule {
  validate(value: unknown): string | null {
    return validateStringValues(value, "person.name", (item) =>
      PERSON_NAME_REGEX.test(item),
    );
  }
}
