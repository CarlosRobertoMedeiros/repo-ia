movieName = "Top Gun"
movieDescription = """
    Top Gun Maverick é um filme de aviação e aventura
muito consagrado na indústria    
"""
print(movieName.upper()) # tudo maíusculo
print(movieName.lower()) # tudo minusculo
print(movieName.capitalize()) # Primeira letra maiscula
print(movieName.title()) # Primeira letra maiscula
print(movieName.center(10, '-')) # Retorna string centralizada com caractere de preenchimento
print(movieName.find("u")) # Retorna a posição ou índice de um determinado caractere
print(movieName.find("o")) # conta caracteres
print(movieName.replace("Top","Matrix")) # Altera elemento por outro
print(movieName.split(',')) # Retorna um Array por virgula