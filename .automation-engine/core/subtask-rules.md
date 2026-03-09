# Geração de Subtarefas — Regras e Padrão

## Quando gerar

**SOMENTE na Etapa 10 — após:**
- Código gerado e validado ✅
- Aprovação humana recebida (modo manual) ✅
- Testes gerados e passando ✅

**Nunca gerar subtarefas antes da execução estar completa.**

---

## Processo obrigatório antes de gerar

### 1. Revisar tudo que foi feito
- Quais arquivos foram criados ou modificados?
- Qual lógica foi implementada?
- Quais integrações foram feitas?
- Quais problemas foram encontrados e resolvidos?

### 2. Avaliar complexidade real
Não base a quantidade de subtarefas no título da história.
Base na execução real:
- Quantas áreas foram afetadas?
- Houve integração de API?
- Houve criação de endpoint?
- Houve tratamento de estados (loading, error)?
- Houve testes criados?

### 3. Filtrar pelo critério de valor
Cada subtarefa deve passar no filtro:
> "Alguém que não fez o trabalho consegue entender o que foi feito e por quê?"

Se sim → incluir.  
Se não → descartar ou reformular.

---

## Regras de linguagem

**Use verbos de ação:**
- Implementar, Integrar, Criar, Ajustar, Validar, Garantir, Extrair, Refatorar, Configurar

**Linguagem clara:**
- ✅ "Integrar componente com endpoint de dados do carrossel"
- ❌ "Implementar hook useCarouselData com axios e tratamento de Promise"

**Foco em resultado e intenção:**
- ✅ "Garantir feedback visual durante carregamento de dados"
- ❌ "Adicionar useState loading e renderização condicional"

**Técnico só quando agrega valor ao time:**
- ✅ "Criar endpoint GET /api/carousel no back-end" (informa que há mudança no back-end)
- ❌ "Adicionar rota no carouselRouter com controller thin pattern" (detalhe que não ajuda o PO)

---

## Quantidade

**Não há número fixo.** A quantidade deve refletir o trabalho real.

Referências:
- Tarefa LOW simples: 2-4 subtarefas
- Tarefa MEDIUM com API: 4-7 subtarefas
- Tarefa HIGH full-stack: 6-10 subtarefas

Se o trabalho foi simples → poucas subtarefas. Não infle.  
Se o trabalho foi complexo → mais subtarefas. Não resuma demais.

---

## Formato de saída

```
SUBTAREFAS — [TÍTULO EXATO DA HISTÓRIA]
══════════════════════════════════════════

✅ [Verbo] [o que] [contexto quando necessário]
✅ [Verbo] [o que] [contexto quando necessário]
✅ [Verbo] [o que] [contexto quando necessário]
[...]

Observações para o time:
[Informação relevante para PO, QA ou outro dev — deixe em branco se não houver]
```

---

## Exemplos

### Exemplo — História: "Tornar carrossel dinâmico"

```
SUBTAREFAS — Tornar o conteúdo do carrossel dinâmico
══════════════════════════════════════════════════════

✅ Identificar e extrair conteúdo estático do componente Carousel
✅ Criar endpoint GET /api/carousel para fornecer dados dinamicamente
✅ Integrar componente com API usando hook de dados dedicado
✅ Garantir feedback visual durante carregamento e em caso de erro
✅ Validar renderização com dados reais em ambiente local
✅ Implementar testes do componente e do hook de integração

Observações para o time:
Dados do carrossel agora vêm da API — para alterar o conteúdo,
atualizar via back-end sem necessidade de redeploy do front.
```

### Exemplo — História: "Corrigir typo no botão de confirmação"

```
SUBTAREFAS — Corrigir texto do botão de confirmação
═════════════════════════════════════════════════════

✅ Corrigir texto do botão na tela de confirmação de pedido
✅ Validar que a correção está visível nos três breakpoints (mobile, tablet, desktop)

Observações para o time:
Correção simples de texto — sem impacto em lógica ou integração.
```
