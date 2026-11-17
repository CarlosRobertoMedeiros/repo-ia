import { validateStringValues } from "../rule.utils";
import { ValidationRule } from "../validation-rule.interface";

const BCRYPT_HASH_REGEX = /^\$2[abxy]\$\d{2}\$[./A-Za-z0-9]{53}$/;

export class BcryptHashRule implements ValidationRule {
  validate(value: unknown): string | null {
    return validateStringValues(value, "bcrypt.hash", (item) =>
      BCRYPT_HASH_REGEX.test(item),
    );
  }
}
