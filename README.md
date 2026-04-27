# TermoMed

TermoMed e um jogo de treino inspirado no Termo/Wordle, feito para revisar termos medicos de 5 letras.

O jogador tem 6 tentativas para descobrir o termo. A cada erro, uma nova dica do termo sorteado e liberada, ate o limite de 5 dicas.

## Funcionalidades

- Termos medicos de 5 letras.
- Aceita qualquer palavra alfabetica de 5 letras como tentativa.
- Feedback por cor:
  - Verde: letra correta na posicao correta.
  - Amarelo: letra existe, mas em outra posicao.
  - Escuro: letra ausente.
- Dicas progressivas para cada termo.
- Definicao e categoria exibidas ao final.
- Estatisticas locais salvas no navegador.
- Teclado fisico e teclado virtual.

## Tecnologias

- React
- TypeScript
- Vite
- Lucide React

## Como Rodar

Instale as dependencias:

```bash
npm install
```

Inicie o servidor local:

```bash
npm run dev
```

Acesse:

```txt
http://127.0.0.1:5173/
```

Para gerar a versao de producao:

```bash
npm run build
```

Para visualizar o build:

```bash
npm run preview
```

## Estrutura

```txt
src/
  App.tsx
  data/
    terms.ts
  game/
    evaluateGuess.ts
    normalizeWord.ts
    pickTerm.ts
  main.tsx
  styles.css
```

## Banco De Termos

Os termos ficam em `src/data/terms.ts`.

Cada termo possui:

- `word`: resposta de 5 letras.
- `definition`: explicacao exibida ao final.
- `category`: area medica relacionada.
- `hints`: 5 dicas progressivas.

Exemplo:

```ts
{
  word: 'sepse',
  definition: 'Disfuncao organica potencialmente fatal causada por resposta desregulada a infeccao.',
  category: 'Infectologia',
  hints: [
    'Comeca simples, mas pode piorar rapido',
    'O corpo reage de forma descontrolada',
    'Geralmente tem origem infecciosa',
    'Pode comprometer varios orgaos',
    'Situacao grave que exige urgencia.',
  ],
}
```

## Subir Para O GitHub

Depois de criar um repositorio no GitHub, rode:

```bash
git init
git add .
git commit -m "Initial TermoMed app"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/termomed.git
git push -u origin main
```

Substitua `SEU_USUARIO` pelo seu usuario do GitHub.

## Publicar No GitHub Pages

Este projeto ja inclui um workflow em `.github/workflows/deploy.yml`.

Depois de enviar os arquivos para o GitHub:

1. Abra o repositorio no GitHub.
2. Va em `Settings`.
3. Va em `Pages`.
4. Em `Build and deployment`, selecione `GitHub Actions`.
5. Va em `Actions` e aguarde o workflow `Deploy to GitHub Pages` finalizar.

O Vite esta configurado com:

```ts
base: '/TermoMed/'
```

Isso e necessario porque o site sera acessado em uma subpasta:

```txt
https://c7fsznn6tk-ship-it.github.io/TermoMed/
```

Se o nome do repositorio mudar, atualize o `base` em `vite.config.ts` para o novo nome.
