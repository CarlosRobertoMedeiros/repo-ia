import {
  DomainError,
  EmailRule,
  MaxLengthRule,
  MinLengthRule,
  PersonNameRule,
  RequiredRule,
  StrongPasswordRule,
  UseCase,
  Validator,
} from "@sdd/shared";
import { User } from "../model";
import { CryptoProvider, UserRepository } from "../provider";

export interface SaveUserIn {
  id?: string;
  name: string;
  email: string;
  password?: string;
}

/**
 * Cria ou atualiza um usuario. A decisao e tomada pelo repositorio: se `id`
 * veio e `findById` encontra o usuario, atualiza; caso contrario cria, usando
 * o `id` recebido ou gerando um novo. Em atualizacao sem `password` (ausente
 * ou vazio) o hash atual e mantido, sem novo hash.
 */
export class SaveUser implements UseCase<SaveUserIn, void> {
  constructor(
    private readonly cryptoProvider: CryptoProvider,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: SaveUserIn): Promise<void> {
    const existing = input.id
      ? await this.userRepository.findById(input.id)
      : null;
    const keepsCurrentPassword = existing !== null && !input.password;

    Validator.validate([
      {
        code: "user.name",
        value: input.name,
        rules: [
          new RequiredRule(),
          new MinLengthRule(3),
          new MaxLengthRule(80),
          new PersonNameRule(),
        ],
      },
      {
        code: "user.email",
        value: input.email,
        rules: [new RequiredRule(), new EmailRule()],
      },
      {
        code: "user.password",
        value: input.password,
        rules: keepsCurrentPassword
          ? []
          : [new RequiredRule(), new StrongPasswordRule()],
      },
    ]);

    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();

    const userWithSameEmail = await this.userRepository.findByEmail(email);

    if (userWithSameEmail && userWithSameEmail.id !== existing?.id) {
      throw new DomainError("user.email.already.registered", 409);
    }

    const password =
      existing && keepsCurrentPassword
        ? existing.password
        : await this.cryptoProvider.encrypt(input.password as string);

    if (existing) {
      const updated = existing.clone({ name, email, password });

      updated.validate();
      await this.userRepository.update(updated);
      return;
    }

    const created = new User({ id: input.id, name, email, password });

    created.validate();
    await this.userRepository.create(created);
  }
}
