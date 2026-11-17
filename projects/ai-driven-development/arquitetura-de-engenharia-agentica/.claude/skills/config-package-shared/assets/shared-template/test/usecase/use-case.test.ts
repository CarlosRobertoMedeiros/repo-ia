import { UseCase } from "../../src/index";

interface CreateGreetingInput {
  name: string;
}

interface CreateGreetingOutput {
  message: string;
  normalizedName: string;
}

class CreateGreetingUseCase implements UseCase<
  CreateGreetingInput,
  CreateGreetingOutput
> {
  async execute(input: CreateGreetingInput): Promise<CreateGreetingOutput> {
    const normalizedName = input.name.trim();

    return {
      message: `Ola, ${normalizedName}!`,
      normalizedName,
    };
  }
}

describe("UseCase", () => {
  test("deve permitir criar um caso de uso concreto com entrada e saida tipadas", async () => {
    const useCase = new CreateGreetingUseCase();

    const output = await useCase.execute({
      name: "  Leonardo  ",
    });

    expect(output).toEqual({
      message: "Ola, Leonardo!",
      normalizedName: "Leonardo",
    });
  });
});
