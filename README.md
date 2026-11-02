# FinanTech RPA — Controle Financeiro

Aplicação estática para testes de automação no cadastro de títulos financeiros fictícios. Não usa backend nem banco de dados.

## Executar localmente

Na pasta `rpa-portal-financeiro`, inicie um servidor estático:

```powershell
py -m http.server 8000
```

Abra `http://localhost:8000/templates/login.html`.

## GitHub Pages

Após publicar a branch `main` com a pasta raiz como origem do GitHub Pages, acesse:

<https://willian837.github.io/rpa-portal-financeiro/>

## Acesso demonstrativo

- Usuário: `admin`
- Senha: `FinRPA!2026#N7vQ4sL`

O login é validado no JavaScript do navegador; não é autenticação segura para uso real. Não use dados financeiros ou pessoais verdadeiros.

O acesso exige confirmar que o sistema será usado apenas com dados fictícios. Essa confirmação é um aviso para testes, não é consentimento LGPD nem torna apropriado inserir dados reais.

## Dados e automação

- Os títulos começam vazios e são armazenados no `localStorage` do navegador.
- Os campos seguem a planilha `documentos/titulos-financeiros-ficticios.xlsx`; os 100 registros não são importados automaticamente, para que o RPA possa cadastrá-los durante os testes.
- A API `window.RPAFinanceiro` oferece `adicionar(dados)`, `obter()`, `total()` e `limpar()` na página do painel.
- Os dados ficam no perfil e na origem do navegador onde foram cadastrados; limpar os dados do navegador pode apagá-los.

## Estrutura

```text
css/        Estilos do login e do painel
js/         Autenticação demonstrativa e cadastro de títulos
static/     Imagem de fundo do login
templates/  Login e painel financeiro
```
