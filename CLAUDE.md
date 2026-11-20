# Regras do projeto Saúde e Rotina

- Toda mudança no app (tela, campo, regra, fluxo) deve vir acompanhada, no mesmo commit, de:
  1. atualização do treinamento em `ajuda.js` (lições afetadas, item em `NOVIDADES` e nova `VERSAO` com a data);
  2. atualização do `README.md`.
- O app nunca indica remédios, suplementos ou doses; só alimentação, exercícios e rotina. Quando algo vai além disso, mostrar alerta para conversar com o médico.
- Não mencionar nenhuma igreja nem conteúdo de fé no app.
- Textos em português do Brasil, linguagem simples.
- Mudanças no banco de dados: manter as políticas de segurança (RLS) com `is_active()` e conferir os avisos de segurança do Supabase depois.
