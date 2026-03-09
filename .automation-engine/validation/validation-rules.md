# Validation Rules — TypeScript + React + Node.js

## Quando executar

Executar **SEMPRE** após a Etapa 6 (código gerado), antes de qualquer coisa.

---

## FASE 1 — TypeScript

```
□ Nenhum `any` explícito ou implícito sem justificativa
□ Interfaces e types definidos para todo dado externo (API response, props, params)
□ Funções assíncronas com tipo de retorno explícito (Promise<T>)
□ Event handlers tipados corretamente (React.ChangeEvent, React.MouseEvent, etc.)
□ useState com tipo explícito quando não inferível (useState<T>)
```

**Como verificar:** mentalmente compilar o código. Se houver dúvida → investigar o projeto.

---

## FASE 2 — React / Front-end

```
□ Componente exportado corretamente (default ou named, consistente com o projeto)
□ Props tipadas com interface separada
□ useEffect com array de dependências correto
□ Sem memory leak (cleanup em useEffect quando necessário)
□ Loading state implementado (qualquer fetch → mostrar loading)
□ Error state implementado (qualquer fetch → tratar erro)
□ Dados nunca acessados sem verificação de null/undefined
□ Listas sempre com key única e estável (não index quando possível)
□ Formulários: prevent default em submit
```

---

## FASE 3 — Node.js / Back-end

```
□ Rota registrada no arquivo de rotas correto
□ Controller: apenas recebe, valida, delega — sem lógica de negócio
□ Service: lógica isolada e testável
□ Validação de entrada (body, params, query) antes de processar
□ Resposta padronizada: { success, data?, error? }
□ Try/catch em toda operação assíncrona
□ Status HTTP correto: 200, 201, 400, 401, 404, 500
□ Sem dados sensíveis no response (senha, token, PII)
□ Variáveis de ambiente documentadas no .env.example
```

---

## FASE 4 — Integração (quando front chama back)

```
□ URL do endpoint usando variável de ambiente (NEXT_PUBLIC_API_URL ou similar)
□ Headers corretos (Content-Type, Authorization se necessário)
□ Tratamento do erro HTTP (4xx, 5xx) no front
□ Tipos da response da API coincidem com o que o back retorna
□ Timeout configurado se necessário
```

---

## FASE 5 — Testes

```
□ Arquivo de teste no caminho correto (*.test.tsx, *.spec.ts)
□ Describe e it/test com nomes descritivos
□ Mock de fetch/axios/módulos externos configurado antes dos testes
□ Cada teste independente (sem dependência de ordem de execução)
□ Estados testados: initial, loading, success, error, empty
□ Cleanup após testes com useEffect (se aplicável)
```

---

## Resultado da Validação

**Todos os itens OK:**
```
✅ VALIDAÇÃO PASSOU — código pronto para [revisão humana / testes]
```

**Algum item falhou:**
```
❌ VALIDAÇÃO FALHOU
Problema: [descrição exata]
Arquivo: [onde está o problema]
Correção: [o que vai ser feito]
```
→ Corrigir e revalidar antes de continuar.
