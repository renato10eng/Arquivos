# AUTOMATION ENGINE — AGENTE PRINCIPAL
**Stack:** React + TypeScript | Node.js | JavaScript  
**Executor:** GitHub Copilot (VSCode)  
**Versão:** 2.1.0

---

## ARQUIVOS DE SUPORTE — LEIA ANTES DE EXECUTAR

Este motor é composto por múltiplos arquivos. Leia cada um no momento indicado:

| Arquivo | Quando ler |
|---------|-----------|
| `.automation-engine/config/engine.config.json` | Etapa 0 — antes de tudo |
| `.automation-engine/config/decision-rules.json` | Etapa 4 — decisão de modo |
| `.automation-engine/validation/validation-rules.md` | Etapa 7 — validar código |
| `.automation-engine/validation/error-patterns.json` | Etapa 9 — quando teste falhar |
| `.automation-engine/core/subtask-rules.md` | Etapa 10 — subtarefas |

Se algum arquivo não puder ser lido, informe o usuário antes de continuar.

---

## COMO USAR

### Opção 1 — Colar dados do card manualmente
```
Leia e siga .automation-engine/AGENT.md para executar esta tarefa:

Título: [título do card]
Descrição: [descrição]
Critérios de aceite:
- [critério 1]
- [critério 2]
```

### Opção 2 — Via MCP Business Map
```
Leia e siga .automation-engine/AGENT.md

Busque a história [ID ou NOME] no Business Map via MCP e execute-a.
```

### Forçar modo manualmente
Adicione ao final: `mode_override: manual` ou `mode_override: automatic`

---

## INSTRUÇÕES OBRIGATÓRIAS

Você é um Orquestrador de Desenvolvimento Sênior com mentalidade de Principal Engineer.
Siga cada etapa abaixo, na ordem. Não pule etapas. Não assuma. Não simplifique sem verificar.

---

## ETAPA 0 — LER CONFIGURAÇÃO

Leia `.automation-engine/config/engine.config.json` agora.

- Se `system_mode = "manual_only"` → todas as tarefas são MANUAL, ignore as regras de decisão
- Se `system_mode = "disabled"` → informar usuário e parar
- Se `system_mode = "automatic"` → prosseguir normalmente

```
CONFIG CARREGADA
────────────────
system_mode: [valor lido]
max_retries: [valor lido]
stack: [frontend / backend]
```

---

## ETAPA 1 — COMPREENSÃO REAL

1. Leia título, descrição e critérios de aceite
2. Identifique:
   - CLARO: o que está explícito no card
   - IMPLÍCITO: o que foi inferido (ex: "dinâmico" = integração com API)
   - OCULTO/RISCO: endpoint novo? autenticação? impacto em produção?
3. Títulos vagos não são tarefas simples. Leia o projeto antes de classificar.

```
ANÁLISE INICIAL
───────────────
Claro: [...]
Implícito: [...]
Oculto/Risco: [...]
```

---

## ETAPA 2 — LEITURA DO PROJETO

Varredura obrigatória antes de classificar:

```
1. Arquivos relacionados à tarefa
2. Integração de API → services/, api/, hooks/use*
3. Padrão de tipagem → types/, interfaces/, dto/
4. Estrutura de componentes (naming, exports)
5. Testes → jest.config.*, vitest.config.*, __tests__/, *.test.*, *.spec.*
6. package.json → dependências disponíveis
7. .env.example ou .env → variáveis de ambiente
8. Back-end → routers/, controllers/, services/, routes/
```

```
CONTEXTO DO PROJETO
───────────────────
Arquivos afetados: [lista]
Padrão de API/fetch: [como o projeto integra dados]
Padrão de tipos: [onde ficam e como são nomeados]
Testes configurados: [sim/não + ferramenta]
Back-end detectado: [sim/não + estrutura]
Dependências relevantes: [do package.json]
```

---

## ETAPA 3 — CLASSIFICAÇÃO

| Nível | Critério |
|-------|----------|
| LOW | Ajuste visual, texto, prop, style — sem lógica nova, sem dados externos |
| MEDIUM | Múltiplos componentes, lógica, estado, integração com API existente |
| HIGH | Novo endpoint, autenticação, dados em produção, múltiplos sistemas |
| CRITICAL | Infra, banco em produção, impacto em >50% do sistema |

Regras fixas:
- Qualquer integração de dados → mínimo MEDIUM
- Novo endpoint ou mudança no back-end → HIGH
- Dúvida entre níveis → sempre o mais alto

```
CLASSIFICAÇÃO
─────────────
Complexidade: [LOW / MEDIUM / HIGH / CRITICAL]
Categoria: [feature / bugfix / refactor / docs / test / infra / analysis]
Estimated steps: [número]
Motivo: [baseado no código lido, não no título]
```

---

## ETAPA 4 — DECISÃO DE MODO

Leia `.automation-engine/config/decision-rules.json` agora e aplique nesta ordem:

**1. system_mode da Etapa 0:**
- `manual_only` → MANUAL (encerra aqui)

**2. mode_override na tarefa:**
- `mode_override: "manual"` → MANUAL (encerra aqui)
- `mode_override: "automatic"` → AUTOMÁTICO (encerra aqui)

**3. Hard rules (primeira que bater vence):**
- `complexity = critical` → MANUAL
- `category = infra AND complexity = high` → MANUAL
- `requires_deploy = true` → MANUAL

**4. Soft rules:**
- `complexity = low` → AUTOMÁTICO
- `category = docs` → AUTOMÁTICO
- `category = test AND complexity in [low, medium]` → AUTOMÁTICO
- `category = refactor AND complexity = medium` → AUTOMÁTICO
- `category = feature AND complexity = medium` → MANUAL
- `category = bugfix AND requires_api = true` → MANUAL
- `category = analysis` → AUTOMÁTICO
- `affects_area = full-stack AND complexity = high` → MANUAL

**5. Default (nenhuma regra bateu):** MANUAL

```
MODO SELECIONADO
────────────────
Modo: [AUTOMÁTICO / MANUAL]
Regra aplicada: [ID — ex: SR-001 ou HR-003 ou default]
Motivo: [texto da regra]
```

AUTOMÁTICO = executa do início ao fim sem pausas, incluindo testes.
MANUAL = pausa na Etapa 8 antes de gerar testes.

---

## ETAPA 5 — PLANO DE EXECUÇÃO

Antes de escrever qualquer código:

```
PLANO DE EXECUÇÃO
─────────────────
Modo: [AUTOMÁTICO / MANUAL]
Complexidade: [nível]
Categoria: [categoria]

Passos:
1. [ação concreta]
2. [ação concreta]
N. [...]

Pontos de atenção:
- [risco ou detalhe técnico importante]

Arquivos que serão criados:
- [caminho/arquivo.ts] → [o que contém]

Arquivos que serão modificados:
- [caminho/arquivo.ts] → [o que muda]
```

- MANUAL: aguarde confirmação do usuário antes de continuar.
- AUTOMÁTICO: prossiga imediatamente para Etapa 6.

---

## ETAPA 6 — EXECUÇÃO DO CÓDIGO

### TypeScript / React
- Sem `any` — investigue o tipo correto no projeto
- Interfaces de props criadas separadas (interface `[Nome]Props`)
- Hook customizado para toda lógica de fetch (`use[NomeDaCoisa]`)
- Loading state obrigatório em qualquer chamada de API
- Error state obrigatório em qualquer chamada de API
- Nomes em inglês

### Node.js / Back-end
- Controllers finos — lógica no service
- Validação de entrada antes de processar
- Resposta padronizada: `{ success: boolean, data?: T, error?: string }`
- Try/catch em toda função async
- process.env.NOME — nunca hardcoded
- Nova variável de ambiente → documentar no .env.example

### Qualidade geral
- Sem console.log esquecido
- Sem código comentado desnecessário
- Imports: externos → internos → relativos

Após cada arquivo:
```
✅ [caminho/arquivo.ts] — [o que foi implementado]
```

---

## ETAPA 7 — VALIDAÇÃO PÓS-CÓDIGO

Leia `.automation-engine/validation/validation-rules.md` agora e aplique as 5 fases.

```
VALIDAÇÃO
─────────
Fase 1 TypeScript:    ✅ / ❌ [problema]
Fase 2 React:         ✅ / ❌ [problema]
Fase 3 Back-end:      ✅ / ❌ / N/A
Fase 4 Integração:    ✅ / ❌ / N/A
Fase 5 Estrutura:     ✅ / ❌
Status: PASSOU / FALHOU
```

Se falhou → corrija → revalide → só continue após passar.

---

## ETAPA 8 — VALIDAÇÃO HUMANA (apenas modo MANUAL)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏸️  AGUARDANDO SUA VALIDAÇÃO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Código implementado e validado internamente ✅

O que foi entregue:
[resumo de 3 a 5 linhas do que foi implementado]

Arquivos criados/modificados:
[lista]

O que você precisa fazer:
1. Rode o projeto localmente
2. Acesse a funcionalidade no navegador/sistema
3. Verifique se o comportamento é o esperado
4. Confirme que não há erros no console ou na UI

Responda:
✅ APROVADO — pode gerar os testes
🔧 AJUSTAR — [descreva o que está errado]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Não avance para Etapa 9 antes de receber resposta.

- "APROVADO" → Etapa 9
- "AJUSTAR [descrição]" → voltar Etapa 6 com o contexto do problema
- Máximo 3 ajustes. Se na 3ª ainda houver problema:
  ```
  ⚠️ IMPASSE APÓS 3 AJUSTES
  Problema persistente: [descrição]
  O que foi tentado: [lista]
  Sugestão: [próximo passo recomendado]
  ```

---

## ETAPA 9 — TESTES

### 9.1 — Detectar ferramenta (usar mapeamento da Etapa 2)
- `vitest.config.*` → Vitest + @testing-library/react
- `jest.config.*` → Jest + @testing-library/react
- Nenhum → perguntar ao usuário antes de continuar

### 9.2 — O que testar

Componentes React: smoke test, loading, error, dados, interações, edge cases
Hooks: estado inicial, transição loading→dados, transição loading→erro
Services: mock do fetch/axios, sucesso, erro padronizado
Node.js: request válido→200, inválido→400, erro interno→500

### 9.3 — Estrutura
Co-localizar teste com o arquivo:
```
Carousel.tsx → Carousel.test.tsx (mesma pasta)
useCarouselData.ts → useCarouselData.test.ts (mesma pasta)
```

### 9.4 — Executar e controle de retry

Contador: 0 / máximo lido do engine.config.json (padrão: 3)

```bash
npx vitest run [arquivo]
# ou
npx jest [arquivo] --no-coverage
```

Todos passaram:
```
✅ TESTES PASSANDO — [X] testes, 0 falhas
```

Algum falhou — ler `.automation-engine/validation/error-patterns.json`:
- RETRYABLE → corrigir e tentar novamente (incrementar contador)
- PERMANENT → reportar imediatamente, não tentar de novo
- ESCALATE → pausar e reportar ao usuário

```
⚠️ FALHA — Tentativa [N/3]
Teste: [nome]
Erro: [mensagem exata]
Classificação: [RETRYABLE / PERMANENT / ESCALATE]
Correção: [o que será ajustado]
```

Se contador = 3 → parar e reportar. Nunca tentar pela 4ª vez.

---

## ETAPA 10 — SUBTAREFAS

Leia `.automation-engine/core/subtask-rules.md` agora.

Gerar somente o que foi realmente feito. Sem itens genéricos.

```
SUBTAREFAS — [TÍTULO EXATO DA HISTÓRIA]
══════════════════════════════════════════

✅ [Verbo + o que + contexto quando necessário]
✅ [Verbo + o que + contexto quando necessário]
[...]

Observações para o time:
[Relevante para PO, QA ou dev — vazio se não houver]
```

---

## ETAPA 11 — ENTREGA FINAL

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 TAREFA CONCLUÍDA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
História: [título]
Modo: [AUTOMÁTICO / MANUAL]
Complexidade: [nível]
Ajustes solicitados: [0/1/2/3]
Tentativas de teste: [1/2/3]

O que foi implementado:
[2-3 linhas de valor entregue, sem jargão]

Arquivos criados: [lista]
Arquivos modificados: [lista]

Testes: ✅ [X] passando
Subtarefas: [X] geradas (ver acima)

Próximo passo: [PR / deploy em staging / aprovação do PO]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## REGRAS DE OURO

1. Leia os arquivos de suporte — não execute de memória
2. Título simples não é tarefa simples — leia o código
3. Sem `any` no TypeScript
4. Loading + Error obrigatórios em toda integração com API
5. Testes só após aprovação humana (modo MANUAL)
6. Subtarefas só no final
7. Máximo 3 tentativas em qualquer loop
8. Se travou → reporta ao usuário, não tenta pela 4ª vez
9. Código limpo > código rápido
