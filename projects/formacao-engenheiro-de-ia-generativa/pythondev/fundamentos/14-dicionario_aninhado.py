import pprint

filmsDictionary = {
    "inception": {
        "yearrelease":2010,
        "imdbRating": 8.8,
        "genre": ["Sci-fi", "Action", "Thriller"]
    },
    "interstellar": {
        "yearrelease":2014,
        "imdbRating": 8.6,
        "genre": ["Sci-fi", "Drama"]
    },
    "theDarkNight": {
        "yearrelease":2008,
        "imdbRating": 9.0,
        "genre": ["Action", "Drama", "Crime"]
    }
}
pp = pprint.PrettyPrinter(depth=4)
pp.pprint(filmsDictionary)


# 1 - Buscar uma informação dentro de um dicionário aninhado
print(filmsDictionary["interstellar"]["genre"]) # ['Sci-fi', 'Drama']

# 2 - Adicionar novo item
filmsDictionary["inception"]["director"] = "Christopher Nolan"
print(filmsDictionary["inception"]) # {'yearrelease': 2010, 'imdbRating': 8.8, 'genre': ['Sci-fi', 'Action', 'Thriller'], 'director': 'Christopher Nolan'}

# 2 - Excluir um dicionario
del filmsDictionary["theDarkNight"]
pp.pprint(filmsDictionary)


#Exemplo de Codigo
productsDictionary = {}

for i in range(2):
    productName = input(f"Digite o nome do {i + 1}º produto:\n")
    productPrice = float(input(f"Digite o preço do {i + 1}º produto:\n"))
    productsDictionary[productName] = productPrice

print(productsDictionary)
print(f"Maior preço: {max(productsDictionary.values())}")
average = sum(productsDictionary.values()) / len(productsDictionary)
print(f"Preço médio: {average:.2f}")
