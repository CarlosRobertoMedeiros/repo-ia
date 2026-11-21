filmsList = ["Inception", "The Shadow Redemption",
             "The Dark Kinght", "Pulp Fiction", "Interstellar"]



# 1 - Verificar o tamanho da Lista
print(len(filmsList)) # 5

# 2 - REcupera uma lista por nome
print(filmsList.index("The Shadow Redemption")) # 1

# 3 - Adicinar um item ao final da Lista
filmsList.append("The Lord of the Rings")
print(filmsList)

# 4 - Ordenar a lista
filmsList.sort()
print(filmsList)

# 5 - Copiar os items de uma lista para a outra
filmsCopy = filmsList.copy()
filmsCopy.remove("Pulp Fiction")
print(filmsList)
print(filmsCopy)

# 6 - Remove todos os items da lista
filmsList.clear()
print(filmsList)