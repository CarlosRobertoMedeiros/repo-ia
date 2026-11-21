num1 = int(input("Digite o primeiro número:\n"))
num2 = int(input("Digite o segundo número:\n"))

#Operações Aritméticas
sum = num1+num2
sub = num1-num2
div = num1/num2
mult = num1*num2
mod = num1 % num2 # Mod
exp = num1 ** num2 # Exponenciação

print(f"Soma do numero {num1} e {num2} e:",sum)
print(f"Subtracao do numero {num1} e {num2} e:",sub)
print(f"Divisao do numero {num1} e {num2} e:",div)
print(f"Multiplicacao do numero {num1} e {num2} e:",mult)
print(f"Mod(Resto da Divisao) do numero {num1} e {num2} e:",mod)
print(f"Potenciação do numero {num1} e {num2} e:",exp)

#Comparações
bigger = num1 > num2
smaller = num1 < num2
equal = num1 == num2
different = num1 != num2
bigger_equal =  num1 >= num2
smaller_equal =  num1 <= num2

print(f"Os números {num1} e {num2} são iguais? {equal}")
print(f"O número {num1} e maior ou igual a {num2}? {bigger_equal}")

# Atribuições

num1+=1 #num1 = num1 + 1 
num1-=1 #num1 = num1 - 1
num1*=1 #num1 = num1 * 1
num1/=1 #num1 = num1 / 1

