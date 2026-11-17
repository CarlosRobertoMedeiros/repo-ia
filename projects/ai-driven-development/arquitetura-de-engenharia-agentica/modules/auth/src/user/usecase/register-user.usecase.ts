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

export interface RegisterUserIn {
  name: string;
  email: string;
  password: string;
}

export class RegisterUser implements UseCase<RegisterUserIn, void> {
  constructor(
    private readonly cryptoProvider: CryptoProvider,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: RegisterUserIn): Promise<void> {
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
        rules: [new RequiredRule(), new StrongPasswordRule()],
      },
    ]);

    const email = input.email.trim().toLowerCase();
    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new DomainError("user.email.already.registered", 409);
    }

    const hashedPassword = await this.cryptoProvider.encrypt(input.password);
    const user = new User({
      name: input.name.trim(),
      email,
      password: hashedPassword,
    });

    user.validate();

    await this.userRepository.create(user);
  }
}
