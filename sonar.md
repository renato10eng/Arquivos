Você é um engenheiro sênior especialista em qualidade de código. Tenho o MCP do SonarQube 
configurado e preciso de uma estratégia completa para reduzir dívida técnica com inteligência.

## CONTEXTO DO PROJETO
- Stack: JavaScript/TypeScript (JS, JSX, TS, TSX)
- Testes: Jest com collectCoverage
- SonarQube: já configurado via MCP
- Situação atual:
  - 250+ Code Smells
  - ~10 Bugs
  - Severidade: Major (10/30)
  - Score não está aumentando
  - Alguns valores aparecem como N/A

---

## FASE 1 — DIAGNÓSTICO COMPLETO (execute primeiro)

Use o MCP do SonarQube para buscar:

1. Liste TODOS os issues abertos agrupados por tipo:
   - Bugs (severidade: blocker, critical, major, minor)
   - Code Smells (severidade: major em primeiro)
   - Vulnerabilities
   - Security Hotspots

2. Para cada grupo, mostre:
   - Regra violada (ex: typescript:S1234)
   - Arquivo afetado
   - Linha
   - Mensagem do Sonar
   - Effort estimado de correção

3. Verifique as métricas atuais:
   - Reliability Rating (para bugs)
   - Maintainability Rating (para code smells)
   - Coverage (%)
   - Duplications (%)
   - Quality Gate status
   - Se alguma métrica aparecer como N/A, identifique o motivo

---

## FASE 2 — ANÁLISE ESTÁTICA E SCORE

Analise por que o score não está subindo:

1. Verifique o Quality Gate configurado:
   - Quais condições estão falhando?
   - O gate usa "new code" ou "overall code"?
   - Existe threshold de coverage que está bloqueando?

2. Para os valores N/A, verifique:
   - O sonar-project.properties está com os paths corretos?
   - O collectCoverage do Jest está gerando lcov.info?
   - O parâmetro sonar.javascript.lcov.reportPaths aponta para o arquivo certo?
   - Existe exclusão de arquivos que não deveria existir?

3. Mostre o sonar-project.properties atual ou sugira a configuração correta:
   sonar.sources=src
   sonar.tests=src
   sonar.test.inclusions=**/*.test.ts,**/*.test.tsx,**/*.test.js,**/*.test.jsx,**/*.spec.ts,**/*.spec.tsx
   sonar.javascript.lcov.reportPaths=coverage/lcov.info
   sonar.coverage.exclusions=**/*.test.*,**/*.spec.*,**/index.ts,**/index.tsx

---

## FASE 3 — PLANO DE ATAQUE ESTRATÉGICO (priorizado)

Com base nos dados coletados, monte um plano de correção em ordem de ROI (máximo impacto, menor esforço):

### PRIORIDADE 1 — Bugs críticos/major (impacto direto no score)
Para cada bug, mostre:
- Arquivo + linha
- Problema exato
- Código atual (se disponível via MCP)
- Correção sugerida com exemplo de código

### PRIORIDADE 2 — Code Smells com maior recorrência (regras mais frequentes)
- Identifique o TOP 10 regras mais violadas
- Para cada regra, explique o padrão de correção UMA VEZ
- Liste todos os arquivos/linhas afetados por aquela regra
- (Corrigir padrões repetitivos = maior ganho de score)

### PRIORIDADE 3 — Coverage (se N/A ou abaixo do threshold)
- Identifique arquivos sem nenhum teste
- Sugira testes unitários Jest prioritários para os arquivos mais críticos
- Mostre exemplo de teste para o padrão do projeto (React component, hook, service, util)

---

## FASE 4 — EXECUÇÃO (corrija arquivo por arquivo)

Para cada correção, siga este formato:

### Arquivo: `src/components/ExampleComponent.tsx`
**Issue:** [descrição do problema - regra sonar]
**Antes:**
```ts
// código problemático
```
**Depois:**
```ts
// código corrigido
```
**Motivo:** [explicação técnica breve]

---

## FASE 5 — VALIDAÇÃO

Após as correções, verifique:
1. Re-execute a análise via MCP e compare os números
2. Mostre o delta: issues fechados vs. abertos
3. Verifique se o Quality Gate mudou de status
4. Se ainda houver N/A, mostre checklist de diagnóstico

---

## REGRAS DE EXECUÇÃO

- Comece SEMPRE pela Fase 1 (diagnóstico) antes de qualquer correção
- Agrupe correções por arquivo para evitar conflitos
- Nunca quebre testes existentes ao corrigir code smells
- Se uma correção for arriscada, sinalize com ⚠️ e explique o risco
- Prefira correções automáticas/padrão para regras recorrentes
- Para coverage N/A: sempre valide o caminho do lcov.info primeiro

Comece agora pela Fase 1 usando o MCP do SonarQube.