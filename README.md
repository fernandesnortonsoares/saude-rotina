# Saúde e Rotina

App web instalável (PWA) para medir e organizar alimentação, exercícios, sono, emoções, hábitos e exames. Ele **não substitui** médico ou nutricionista e **nunca indica remédios, suplementos ou doses**: só alimentação, exercícios e rotina.

- Endereço: https://fernandesnortonsoares.github.io/saude-rotina/
- Banco de dados: Supabase, projeto **Saude e Rotina** (`sacxnnvxexbtgsstrzyc`, região São Paulo)
- Versão do treinamento: veja `ajuda.js` (`AJUDA.VERSAO`)

## Arquivos

| Arquivo | O que tem |
|---|---|
| `index.html` | Estrutura da página, estilos e barra de navegação |
| `app.js` | Toda a lógica: login, telas, regras, relatórios, administração |
| `data.js` | Dados de referência: refeições e horários, plano modelo, exercícios, programa emocional, questionário e regras de exames |
| `ajuda.js` | Treinamento de uso do sistema e novidades da versão |
| `manifest.json`, `icon.svg` | Instalação no celular |

## Telas

| Tela | Função |
|---|---|
| Início | Painel: avisos, resumo de hoje e dos últimos 7 dias, atalhos para tudo |
| Registrar | Sono, refeições (peso comido por item, troca, fora do plano), água e sucos, treino, leitura e lazer, redes sociais, sol, tempo sentado, humor, estresse, finanças e hábitos |
| Plano | Plano semanal editável, plano modelo, sugestões para aceitar ou recusar |
| Avaliação | Questionário completo (saúde com todas as condições com o mesmo peso, cirurgias, tratamentos, remédios só para alertas, vacinas do Calendário Nacional 2026, rotina, alimentação, finanças, sono, atividade, hábitos do dia a dia e redes sociais, vícios, saúde sexual), perguntas conforme o sexo, desenho de como medir a cintura e geração de alertas e sugestões |
| Exames | Registro com referência do laudo, lista conforme o sexo (PSA e testosterona; estradiol e FSH), histórico, evolução e sugestões |
| Emocional | Programa laico de 10 semanas, uma característica por semana |
| Relatórios | 7 e 30 dias, impacto, dia a dia e relatório da semana |
| Avaliar o app | Pesquisa de satisfação, sempre disponível (inclusive com acesso vencido) |
| Como usar | Treinamento de uso e novidades |
| Admin | Só administradores: usuários, validade, pesquisas e resultados |

## Banco de dados (Supabase)

| Tabela | Conteúdo |
|---|---|
| `profiles` | Nome, e-mail, validade (`valid_until`), administrador (`is_admin`), configurações (`config`) |
| `assessments` | Respostas do questionário (`answers` em JSON) |
| `plan_items` | Itens do plano por dia da semana e refeição |
| `meal_logs` | Refeições registradas: plano, troca ou extra, com quantidade |
| `daily_logs` | Registros diários por categoria: sono, agua, treino, rotina, emocional, habitos |
| `exam_results` | Exames com valor e referência |
| `plan_suggestions` | Sugestões geradas, com status pendente, aceita ou recusada |
| `survey_campaigns`, `survey_responses` | Pesquisas de satisfação disparadas e respostas |

## Regras importantes

- **Aviso em todas as telas:** o questionário serve para personalizar a rotina e as sugestões. Ele não é diagnóstico e não substitui o médico ou o nutricionista. Mudanças em remédios dependem sempre do médico.
- **Todas as condições com a mesma ênfase:** nenhuma doença é tratada como principal; as regras se somam e vale a mais restritiva.
- **Vacinas:** lista baseada no Calendário Nacional de Vacinação 2026; revisar a cada nova Instrução Normativa do Ministério da Saúde.
- **Programa emocional:** lições escritas pela equipe com base em princípios de resiliência emocional, sem citar a origem, revisadas por psicólogo antes do lançamento.

- **Validade:** todo cadastro começa com 30 dias. Depois da data, o banco recusa leitura e gravação de todos os dados (função `is_active()` nas políticas de segurança). Só a pesquisa de satisfação continua liberada.
- **Só o administrador muda a validade**, pela função `admin_definir_validade`. O usuário não consegue alterar `valid_until` nem `is_admin`.
- **Administradores automáticos:** contas criadas com nortonsoaresfernandes@gmail.com ou fernandesnortonsoares@gmail.com. Administradores usam o app sem prazo.
- **Privacidade:** cada pessoa só vê os próprios dados. O administrador vê a lista de usuários e o uso, e as respostas da pesquisa de satisfação.
- **Lembretes:** quem fica 3 dias sem registrar vê o lembrete de disciplina no painel; o relatório semanal aparece toda semana.

## Como atualizar

1. Alterar os arquivos e testar.
2. **Atualizar o treinamento em `ajuda.js`**: lições afetadas, lista de NOVIDADES e `VERSAO`. Ao mudar a versão, todos veem o aviso de novidades no painel.
3. **Atualizar este README.**
4. Enviar para o GitHub (`main`); o GitHub Pages publica sozinho.
