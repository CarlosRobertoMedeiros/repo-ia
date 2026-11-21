filmsSet = {"Inception", "The Shadow Redemption",
             "The Dark Kinght", "Pulp Fiction", "Interstellar"}

print(type(filmsSet))

# 1 - Buscar o tamanho do set
print(len(filmsSet)) # 5

# 2 - True e 1 são considerados o mesmo valor
exampleSet = {"Inception", True, 1, 8.7}
print(exampleSet) # {8.7, True, 'Inception'}

# 3 - Adicionar um item de outro Set ""Lembra que o Set não duplica"
filmsSet.update(exampleSet)
print(filmsSet) # {'The Dark Kinght', True, 'Interstellar', 8.7, 'Pulp Fiction', 'Inception', 'The Shadow Redemption'}

# 4 - Remover um item no Set
filmsSet.remove(True)
filmsSet.remove(8.7)
print(filmsSet) # {'Inception', 'The Shadow Redemption', 'Pulp Fiction', 'Interstellar', 'The Dark Kinght'}


# 5 - Código de Exemplo

filmsSet = set()

for i in range(5):
    number = int(input(f"Digite o numero {i + 1}:\n"))
    filmsSet.add(number)

print(filmsSet)
print(len(filmsSet))
print(max(filmsSet))