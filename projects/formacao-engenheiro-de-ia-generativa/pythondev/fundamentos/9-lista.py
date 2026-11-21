filmMatrix = ["Matrix",1999,8.7,True]
print(type(filmMatrix))

filmsList = ["Inception", "The Shadow Redemption",
             "The Dark Kinght", "Pulp Fiction", "Interstellar"]

# buscar os 2 primeiro itens da lista
print(filmsList[:2]) # ['Inception', 'The Shadow Redemption']


# buscar o último itens da lista
print(filmsList[-1]) # 'The Shadow Redemption'

# Buscar filmes até uma determinada posição
print(filmsList[:3]) # ['Inception', 'The Shadow Redemption', 'The Dark Kinght']

# Buscar filmes de uma posição em diante
print(filmsList[1:4]) # ['The Shadow Redemption', 'The Dark Kinght', 'Pulp Fiction']
