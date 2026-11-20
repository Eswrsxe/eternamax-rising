# Eternamax Rising — site reformulado

Site estático, sem dependências (nenhum framework, ícones em SVG próprio). Rotas limpas:
/ · /sobre · /recursos · /equipe · /comunidade · /torneios · /votacoes · /minecraft · /minecraft/wiki

## Para publicar
1. Edite `assets/config.js` e coloque a URL real da API em `API_BASE` (e ajuste `PATHS` se seus endpoints forem diferentes).
2. Suba esta pasta na Vercel (o `vercel.json` já ativa as URLs limpas).
3. Para alterar textos/páginas: edite `build.py` e rode `python3 build.py`.

## Wiki
Dados em `assets/pages/wiki.js`. Só a Caixa Free tinha itens no arquivo enviado; as demais caixas, os Passes e o Calendário estão como "em atualização".
