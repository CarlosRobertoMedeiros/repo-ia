import { describe, expect, test } from '@jest/globals';
import { somar } from "../src/index";

test('Deve somar dois números corretamente', () => {

    const resultado = somar(2,3);
    expect(resultado).toBe(5);
})