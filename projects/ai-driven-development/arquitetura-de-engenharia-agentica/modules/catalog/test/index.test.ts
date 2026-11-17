import { getModuleName } from "../src/index";

test("Deve retornar o nome do modulo configurado", () => {
  expect(getModuleName()).toBe("catalog");
});
