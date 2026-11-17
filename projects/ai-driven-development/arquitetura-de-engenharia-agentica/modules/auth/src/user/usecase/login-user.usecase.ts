import {
  DomainError,
  EmailRule,
  RequiredRule,
  UseCase,
  Validator,
} from "@sdd/shared";
import { CryptoProvider, UserRepository } from "../provider";

export interface LoginUserIn {
  email: string;
  password: string;
}

export interface LoginUserOut {
  id: string;
  name: string;
  email: string;
}

export class LoginUser implements UseCase<LoginUserIn, LoginUserOut> {
  constructor(
    private readonly cryptoProvider: CryptoProvider,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: LoginUserIn): Promise<LoginUserOut> {
    Validator.validate([
      {
        code: "user.email",
        value: input.email,
        rules: [new RequiredRule(), new EmailRule()],
      },
      {
        code: "user.password",
        value: input.password,
        rules: [new RequiredRule()],
      },
    ]);

    const user = await this.userRepository.findByEmail(
      input.email.trim().toLowerCase(),
    );

    // Mesma resposta para usuario inexistente e senha incorreta, para nao
    // revelar quais e-mails estao cadastrados.
    if (!user) {
      throw new DomainError("user.credentials.invalid", 401);
    }

    const passwordMatches = await this.cryptoProvider.compare(
      input.password,
      user.password,
    );

    if (!passwordMatches) {
      throw new DomainError("user.credentials.invalid", 401);
    }

    return { id: user.id, name: user.name, email: user.email };
  }
}
