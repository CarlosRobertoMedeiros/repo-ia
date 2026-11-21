movieName = "Top Gun"

#string[inicio:fim] - indice comeca na pos 0 indice final -1

#1 - Busca toda a string a partir da primeira posição
print(movieName[0]) # T

#2 - Busca toda string até a ultima posição
print(movieName[:7]) #Top Gun

#3 - Busca toda string da terceira até a ultima posição
print(movieName[2:]) #p Gun

"""
string[incio:fim:passo]
índice começa na posição 0 | indice final -1
passo - determina o incremento. Por padrão esse número é o 1.
"""

# 4 - Buscar toda a string de 2 em 2 caracteres
print(movieName[::2]) # Toda String de 2 em 2 TpGn

# 5 - Buscar toda a string nos índices ímpares
print(movieName[1::2]) # o u

# 6 - Inverter uma string de traz pra frente
print(movieName[::-1]) # -1 vai contar da direita para esquerda nuG poT

