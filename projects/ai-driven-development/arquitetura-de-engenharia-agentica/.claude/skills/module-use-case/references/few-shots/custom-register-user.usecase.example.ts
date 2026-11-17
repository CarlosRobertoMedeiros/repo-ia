import { StrongPasswordRule, UseCase, Validator } from "@<scope>/shared";
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
        code: "user.password",
        value: input.password,
        rules: [new StrongPasswordRule()],
      },
    ]);

    const hashedPassword = await this.cryptoProvider.encrypt(input.password);
    const user = new User({
      name: input.name,
      email: input.email,
      password: hashedPassword,
    });

    user.validate();

    await this.userRepository.create(user);
  }
}
