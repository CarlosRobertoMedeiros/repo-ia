name = input("Digite o nome do Filme:\n")
yearLaunch = int(input("Digite o ano de lançamento do Filme:\n"))
noteMovie = float(input("Digite a nota do Filme:\n"))

# Alternativa 1
print("==============================")
print("Alternativa 1")
print("Dados do Filme")
print("==============================")
print("Nome do FIlme:", name)
print("Ano de Lançamento:",yearLaunch)
print("Nota do Filme:",noteMovie)

# Alternativa 2
print("==============================")
print("Alternativa 2")
print("Nome do FIlme:", name, "\nAno de Lançamento:",yearLaunch, "\nNota do Filme:",noteMovie)

# Alternativa 3 FString
print("==============================")
print(f"Nome do jogo: {name}\n"
      f"Ano de Lançamento: {yearLaunch}\n"
      f"Nota do Filme: {noteMovie}\n"
      )