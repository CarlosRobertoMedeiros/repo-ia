#Linguagem e Case Sensitive
movieName = "Top Gun"
movieName2 = "top Gun"
print(movieName==movieName2)

# Aqui imprime respeitando exatamente o cenário multilinha
movieDescription = """
    Top Gun Maverick é um filme de aviação e aventura
muito consagrado na indústria    
"""
print(movieDescription)

#1 - Multiplicação de Strings
line = "="
print(line*50)
print(movieDescription)

#2 - Procura uma palavra dentro de um texto
print("Top" in movieName)
print("ação" in movieName)
