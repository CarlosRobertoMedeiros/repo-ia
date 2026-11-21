filmsTupa = ("Inception", "The Shadow Redemption",
             "The Dark Kinght", "Pulp Fiction", "Interstellar")

print(type(filmsTupa)) # tupla

# 1 - Buscar os 2 primeiros itens da tupla
print(filmsTupa[:2]) # ('Inception', 'The Shadow Redemption')

# 2 - Buscar o último itens da tupla
print(filmsTupa[-1]) # Interstellar

# 3 - Buscar filmes até uma determinada posição
print(filmsTupa[:3]) # ('Inception', 'The Shadow Redemption', 'The Dark Kinght')

# 3 - Buscar filmes de uma posição em diante
print(filmsTupa[2:]) # ('The Dark Kinght', 'Pulp Fiction', 'Interstellar')

# 3 - Recuperar um item da tupla pelo nome
print(filmsTupa.index("Pulp Fiction")) # 3