filmInception = {
    "title":"Inception",
    "yearRelease": 2010,
    "imdbRating": 8.8,
    "genre": ["Sci-fi", "Action", "Thriller"]
}

print(filmInception)
print(len(filmInception))
print(type(filmInception))

# 1 - Recuperar um elemento do dicionário
print(filmInception["genre"]) # ['Sci-fi', 'Action', 'Thriller']
print(filmInception.get("imdbRating")) # 8.8

# 2 - Buscar apenas as chaves do dicionário
print(filmInception.keys()) # ['title', 'yearRelease', 'imdbRating', 'genre']

# 3 - Buscar apenas os valores do dicionário
print(filmInception.values()) # ['Inception', 2010, 8.8, ['Sci-fi', 'Action', 'Thriller']]

# 4 - Buscar items do dicionário com chaves e valor
print(filmInception.items()) # dict_items([('title', 'Inception'), ('yearRelease', 2010), ('imdbRating', 8.8), ('genre', ['Sci-fi', 'Action', 'Thriller'])])

# 5 - Adicinar item no dicionario
filmInception["director"]= "Christopher Nolan"
print(filmInception) # {'title': 'Inception', 'yearRelease': 2010, 'imdbRating': 8.8, 'genre': ['Sci-fi', 'Action', 'Thriller'], 'director': 'Christopher Nolan'}

# 6 - Atualizar itens no dicionario
filmInception.update({"imdbRating": 8.7})
print(filmInception) # {'title': 'Inception', 'yearRelease': 2010, 'imdbRating': 8.7, 'genre': ['Sci-fi', 'Action', 'Thriller'], 'director': 'Christopher Nolan'}

# 7 - Remover itens no dicionario
print("="*20)
filmInception.pop("director")
print(filmInception) # {'title': 'Inception', 'yearRelease': 2010, 'imdbRating': 8.7, 'genre': ['Sci-fi', 'Action', 'Thriller']}

