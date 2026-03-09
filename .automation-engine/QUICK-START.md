# GUIA DE USO RÁPIDO — Automation Engine v2.1.0

## Setup inicial (fazer uma vez)

1. Copie a pasta `.automation-engine` para a **raiz do seu projeto** (onde fica o `package.json`)
2. Abra o VSCode com GitHub Copilot ativo
3. Pronto

---

## Uso diário no GitHub Copilot

Abra o chat do Copilot: `Ctrl+Shift+I` (Windows/Linux) ou `Cmd+Shift+I` (Mac)

### Colar card manualmente

```
Leia e siga .automation-engine/AGENT.md para executar esta tarefa:

Título: Tornar conteúdo do carrossel dinâmico
Descrição: O carrossel está com conteúdo estático. Tornar dinâmico para facilitar manutenção.
Critérios de aceite:
- Conteúdo vem de uma fonte de dados externa
- Não precisa alterar código para mudar o texto do carrossel
```

### Via MCP Business Map

```
Leia e siga .automation-engine/AGENT.md

Busque a história BM-042 no Business Map via MCP e execute-a.
```

---

## Forçar modo

Adicione ao final da sua mensagem:

```
mode_override: manual    ← para forçar revisão humana antes dos testes
mode_override: automatic ← para executar tudo sem pausa
```

---

## O que o motor faz automaticamente

```
Etapa 0  → Lê a configuração do engine
Etapa 1  → Analisa o card (claro, implícito, oculto)
Etapa 2  → Lê o projeto antes de classificar
Etapa 3  → Classifica complexidade real
Etapa 4  → Decide modo (automático ou manual)
Etapa 5  → Apresenta plano e aguarda confirmação (se manual)
Etapa 6  → Escreve o código com padrões TS/React/Node
Etapa 7  → Valida o código em 5 fases
Etapa 8  → Pausa para você validar no navegador (se manual)
Etapa 9  → Gera testes, roda, corrige se necessário
Etapa 10 → Gera subtarefas para colar no Business Map
Etapa 11 → Entrega o resumo final
```

---

## Respostas que o motor espera de você

| Situação | O que responder |
|---|---|
| Confirmar plano | "pode começar" / "ok" / "sim" / "confirmo" |
| Aprovar código para testes | "APROVADO" |
| Pedir ajuste | "AJUSTAR — [descreva o problema]" |
| Cancelar | "cancela" / "para" |

---

## Onde ficam os arquivos

```
.automation-engine/
  AGENT.md                          ← motor principal (referência no chat)
  QUICK-START.md                    ← este arquivo
  config/
    engine.config.json              ← configuração global
    decision-rules.json             ← regras automático vs manual
  core/
    subtask-rules.md                ← como gerar subtarefas
  validation/
    validation-rules.md             ← checklist de validação do código
    error-patterns.json             ← classificação de erros de teste
  tasks/
    incoming/TEMPLATE.task.json     ← template para criar tarefas como arquivo
  logs/
    execution-log.json              ← histórico de execuções
```

---

## Solução de problemas

**Copilot não leu o projeto:**
Certifique-se de que o Copilot Chat está aberto dentro do VSCode com o projeto aberto,
não em uma janela separada.

**Motor escolheu modo errado:**
Use `mode_override: manual` ou `mode_override: automatic` para forçar.

**Testes não estão configurados:**
O motor vai detectar e perguntar se você quer configurar antes de continuar.

**Teste não para de falhar após 3 tentativas:**
O motor reporta o impasse e para. Você decide o próximo passo.
Isso é intencional — evita loops infinitos.

**system_mode está como manual_only:**
Edite `.automation-engine/config/engine.config.json` e mude para `"automatic"`.
