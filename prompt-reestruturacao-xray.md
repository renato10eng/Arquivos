# PROMPT — REESTRUTURAÇÃO COMPLETA DA SKILL "/x-ray"

Quero que você reestruture completamente a skill de segurança "/x-ray" existente neste workspace/projeto.

Antes de modificar qualquer arquivo, analise toda a implementação atual da skill "/x-ray", incluindo:

- estrutura de diretórios;
- "SKILL.md" ou arquivos equivalentes;
- scripts existentes;
- regras ".md";
- schemas;
- comandos;
- automações;
- arquivos temporários;
- lógica de geração de relatórios;
- diretório "xray-out";
- integração com o chat/agente;
- qualquer mecanismo de execução do JFrog CLI;
- qualquer mecanismo relacionado ao Docker;
- qualquer mecanismo de análise de dependências;
- qualquer lógica de comparação de resultados;
- qualquer lógica de compactação/resumo.

Não descarte imediatamente o que já existe. Primeiro identifique o que pode ser reaproveitado.

O objetivo é substituir a arquitetura atual por uma implementação mais simples, modular, determinística, econômica em tokens, segura e reutilizável, mantendo apenas aquilo que fizer sentido.

---

## 1. OBJETIVO PRINCIPAL

Criar uma skill chamada "/x-ray" especializada em:

- análise de vulnerabilidades de dependências;
- análise de dependências transitivas;
- análise e recomendação de "overrides" do npm;
- análise de vulnerabilidades da imagem Docker;
- identificação de vulnerabilidades provenientes de RPM/pacotes do sistema operacional;
- análise de imagem base;
- execução de testes;
- execução de build;
- validação após alterações;
- criação de plano de remediação;
- aplicação controlada das correções;
- validação incremental;
- geração de relatório;
- manutenção de estado;
- retomada de processos interrompidos;
- redução do consumo de contexto/tokens do agente.

A skill deverá funcionar tanto:

1. pelo chat/agente;
2. pelo terminal através de uma CLI/script;
3. pelo VS Code através de "tasks.json".

Todos esses meios devem utilizar os mesmos scripts e o mesmo núcleo de execução, evitando duplicação de lógica.

---

## 2. PRINCÍPIO ARQUITETURAL

A arquitetura deve seguir este princípio:

```
                 /x-ray
                    │
             IA / Chat / VS Code
                    │
                    ▼
             Scripts determinísticos
                    │
                    ▼
             Resultados estruturados
                    │
                    ▼
                xray-out/
                    │
                    ▼
             IA interpreta resultados
```

A IA deve ser responsável principalmente por:

- interpretar;
- classificar;
- explicar;
- criar plano;
- decidir a estratégia de correção;
- identificar riscos;
- sugerir mudanças;
- executar ações autorizadas;
- analisar falhas.

Os scripts devem ser responsáveis por:

- executar comandos;
- coletar resultados;
- normalizar dados;
- executar "jf audit";
- executar scan da imagem;
- executar testes;
- executar build;
- registrar estado;
- gerar resultados estruturados;
- detectar sucesso/falha;
- evitar que grandes volumes de logs sejam enviados desnecessariamente ao contexto da IA.

Não faça a IA processar logs enormes quando um script puder resumir essas informações.

---

## 3. GIT / COMMIT / PUSH

A skill nunca deve executar "git commit", "git push", criar branches ou alterar o histórico do Git. Git deve ser usado apenas para identificar o projeto, a branch atual e o status do workspace (alterações pendentes). A decisão de commit/push é sempre manual, feita pelo desenvolvedor fora da skill.

---

## 4. VERIFICAÇÃO DE DEPENDÊNCIAS EXTERNAS — NÃO INSTALAR AUTOMATICAMENTE

A skill nunca deve instalar ferramentas ou dependências por conta própria — nem via npm global, nem baixando binários da internet, nem puxando algo direto do "jfrog.org" ou de repositórios públicos.

Isso vale para o próprio JFrog CLI ("jf") e para o "jq".

O comando:

```
/x-ray doctor
```

deve verificar se essas ferramentas já estão instaladas e configuradas no ambiente.

Verificar, quando aplicável:

```
node
npm
git
docker
jf
jq
```

Se algo estiver ausente ou mal configurado, a skill deve:

1. informar claramente o que está faltando;
2. informar o que precisa ser configurado;
3. explicar que a instalação/configuração é manual;
4. informar que a instalação/configuração deve seguir o padrão da empresa;
5. parar a execução que depender dessa ferramenta.

A skill não deve tentar contornar a ausência da ferramenta.

Não utilizar:

- instaladores genéricos;
- download automático de binários;
- "npm install -g";
- download direto do "jfrog.org";
- download direto de repositórios públicos;
- qualquer mecanismo equivalente para instalar ferramentas automaticamente.

A skill só pode depender de binários já presentes no ambiente:

```
node
npm
git
docker
jf
jq
```

e da stdlib da linguagem utilizada nos scripts.

Não instalar pacotes novos nem adicionar dependências ao projeto do usuário para a skill funcionar.

---

## 5. CRIAR UM SUMÁRIO HUMANO

Além do "state.json", criar:

```
xray-out/summary.md
```

Esse arquivo deve ser curto e atualizado durante o processo.

Ele deve responder:

- O que foi encontrado?
- O que já foi corrigido?
- O que ainda falta?
- Qual foi a última ação?
- Qual foi o resultado?
- Onde o processo parou?
- Qual é a próxima ação?

Exemplo:

```markdown
# X-Ray Security Status

Status: BLOCKED

## Antes
Critical: 2
High: 14

## Atual
Critical: 0
High: 4

## Concluído
- axios atualizado
- glob corrigido via override
- testes executados
- build validado

## Pendente
- 4 vulnerabilidades relacionadas à imagem
- 1 vulnerabilidade RPM

## Último problema
Docker image scan encontrou vulnerabilidade em pacote RPM.

## Próxima ação
Investigar imagem base.
```

O "summary.md" deve ser o primeiro arquivo que o agente consulta.

---

## 6. ESTRUTURA DO "xray-out"

O resultado deve ser criado dentro do projeto analisado, e não dentro da pasta global da skill.

Estrutura sugerida:

```
meu-projeto/
├── package.json
├── package-lock.json
├── Dockerfile
├── src/
│
└── xray-out/
    ├── state.json
    ├── summary.md
    ├── plan.json
    ├── report.md
    │
    ├── normalized/
    │   ├── dependencies.json
    │   ├── image.json
    │   └── tests.json
    │
    └── raw/
        ├── audit.json
        ├── image.json
        └── logs/
```

A estrutura pode ser adaptada se houver uma solução melhor.

**Regra importante**

A IA deverá consultar primeiro:

```
summary.md
state.json
normalized/
```

Somente deverá consultar:

```
raw/
```

quando for necessário investigar um problema específico.

Nunca carregar logs brutos gigantescos no contexto sem necessidade.

---

## 7. A SKILL DEVE SER PEQUENA

Não transformar a skill em uma coleção enorme de documentação redundante.

Evitar dezenas de ".md" que repitam informações.

A documentação deverá ser modular e enxuta.

Sugestão:

```
skills/
└── x-ray/
    ├── SKILL.md
    │
    ├── rules/
    │   ├── dependencies.md
    │   ├── transitive.md
    │   ├── overrides.md
    │   ├── image.md
    │   ├── rpm.md
    │   └── breaking-changes.md
    │
    ├── scripts/
    │   ├── xray
    │   ├── doctor
    │   ├── scan-deps
    │   ├── scan-image
    │   ├── normalize
    │   ├── test
    │   ├── build
    │   ├── plan
    │   ├── apply
    │   └── verify
    │
    └── schemas/
        ├── state.schema.json
        ├── plan.schema.json
        └── result.schema.json
```

Não crie arquivos apenas para aumentar a documentação.

Cada arquivo deve ter uma responsabilidade clara.

---

## 8. CONTRATO DE SAÍDA ÚNICO

Todo script do núcleo deve possuir uma saída padronizada e previsível.

Cada script deverá suportar:

```
--json
```

retornando um formato fixo e estruturado.

O formato deve ser consistente entre todos os comandos.

Exemplo conceitual:

```json
{
  "command": "scan",
  "status": "success",
  "exit_code": 0,
  "summary": {},
  "data": {},
  "errors": []
}
```

O formato final pode ser adaptado durante a implementação, mas deverá existir um único contrato de saída.

Todos os scripts devem utilizar códigos de saída padronizados:

```
0 = sucesso
1 = falha
2 = bloqueado / precisa de atenção
```

Esse contrato de saída é a interface comum consumida por:

- Chat / Agente
- CLI / Terminal
- VS Code

Nenhuma dessas interfaces deverá criar uma lógica própria para interpretar resultados.

A interpretação deverá ocorrer a partir do mesmo contrato produzido pelos scripts do núcleo.

Mensagens destinadas ao terminal humano podem continuar existindo, mas a saída "--json" deve permanecer estruturada e estável.

---

## 9. VS CODE — TASKS.JSON

A integração com VS Code deverá ser implementada já nesta versão.

Não é necessário criar uma extensão customizada.

Criar um:

```
.vscode/tasks.json
```

no projeto analisado, quando apropriado, expondo os comandos principais:

```
xray scan
xray plan
xray apply
xray verify
xray status
xray resume
xray doctor
xray report
```

Cada tarefa deverá chamar o mesmo script utilizado pelo terminal, sem duplicar lógica.

As tarefas deverão ser executáveis pelo VS Code e mostrar a saída no painel de terminal integrado.

Exemplo conceitual:

```
X-Ray: Scan
X-Ray: Plan
X-Ray: Apply
X-Ray: Verify
X-Ray: Status
X-Ray: Resume
X-Ray: Doctor
X-Ray: Report
```

Não criar uma extensão customizada nesta etapa.

O objetivo é permitir que o desenvolvedor execute os comandos através das tarefas do VS Code sem precisar digitar o comando manualmente.

---

## 10. ESCRITA SEGURA DO "state.json"

Toda atualização de:

```
xray-out/state.json
```

deve ser feita de forma atômica.

Nunca sobrescrever diretamente o arquivo original.

O fluxo deverá ser:

```
state.json
   ↓
gerar novo conteúdo
   ↓
escrever arquivo temporário
   ↓
garantir que a escrita terminou
   ↓
rename/replace atômico
   ↓
state.json atualizado
```

Utilizar o mecanismo apropriado da linguagem/OS para realizar a substituição atômica.

Isso deve evitar corrupção do "state.json" em situações como:

- "Ctrl+C";
- fechamento do VS Code;
- encerramento inesperado do processo;
- queda de conexão durante execução pelo chat;
- interrupção do script.

Se a operação atômica não puder ser concluída, o script deve retornar falha e informar o problema.

---

## 11. CHECKPOINT SERÁ APENAS INTERNO

Em vez de criar commits intermediários, a skill deverá utilizar um mecanismo de estado.

O estado deverá ficar dentro do projeto analisado:

```
xray-out/state.json
```

Esse arquivo deverá registrar, por exemplo:

- data/hora da execução;
- projeto analisado;
- branch atual;
- etapa atual;
- etapa concluída;
- grupo de dependências atual;
- alterações realizadas;
- alterações ainda pendentes;
- último scan;
- último resultado de testes;
- último resultado de build;
- último resultado de imagem;
- vulnerabilidades antes;
- vulnerabilidades depois;
- plano atual;
- status;
- erro encontrado;
- próxima ação recomendada.

Não é obrigatório utilizar exatamente esse formato. Escolha uma estrutura melhor caso exista uma alternativa tecnicamente superior.

O requisito é que o estado seja:

- pequeno;
- estruturado;
- legível por máquina;
- fácil de resumir para humanos;
- persistente entre execuções;
- suficiente para a skill retomar o trabalho.

---

## 12. HASH DO LOCKFILE PARA VALIDAR O WORKSPACE

A cada execução que estabelecer ou atualizar o estado do processo, calcular o hash do arquivo de lock relevante utilizando:

```
git hash-object <lockfile>
```

Para projetos npm, utilizar prioritariamente:

```
package-lock.json
```

quando esse arquivo existir.

Salvar o resultado no:

```
xray-out/state.json
```

Exemplo conceitual:

```json
{
  "workspace": {
    "lockfile": "package-lock.json",
    "lockfile_hash": "..."
  }
}
```

Se o projeto utilizar outro mecanismo de lockfile, detectar adequadamente o arquivo correspondente e registrar qual arquivo foi utilizado.

O cálculo do hash deve ser realizado pelo script, e não pela IA.

Esse procedimento possui custo desprezível de tempo e não deve gerar consumo adicional de tokens.

---

## 13. RESUME — VALIDAÇÃO DO WORKSPACE

O comando:

```
/x-ray resume
```

deverá:

1. ler "state.json";
2. ler "summary.md";
3. identificar onde o processo parou;
4. localizar o lockfile registrado no estado;
5. executar "git hash-object" nesse lockfile;
6. comparar o hash atual com o hash armazenado no "state.json".

Se os hashes forem iguais:

```
workspace = compatível
```

A skill poderá continuar, desde que as demais condições de retomada também estejam satisfeitas.

Se os hashes forem diferentes:

```
workspace = alterado
```

A skill deverá:

- parar;
- informar claramente que o lockfile foi alterado desde o último checkpoint;
- mostrar o hash esperado;
- mostrar o hash atual;
- informar que não continuará automaticamente;
- solicitar que o usuário faça uma nova análise/baseline.

Não tentar resolver a divergência automaticamente.

Essa comparação deverá ser feita pelo script, não pela IA.

Não utilizar a IA para comparar hashes.

---

## 14. COMANDOS DA SKILL

A skill deverá suportar comandos diretos.

### "/x-ray"

Modo interativo.

Quando o usuário simplesmente chamar:

```
/x-ray
```

mostrar opções como:

```
X-Ray Security

[1] Scan
[2] Plan
[3] Apply
[4] Verify
[5] Image
[6] Report
[7] Status
[8] Resume
[9] Doctor
```

O usuário poderá escolher a ação.

---

### "/x-ray scan"

Executar apenas diagnóstico.

Deve analisar:

- dependências;
- vulnerabilidades;
- severidade;
- dependências diretas;
- dependências transitivas;
- versões atuais;
- versões corrigidas;
- possibilidade de correção;
- vulnerabilidades sem versão corrigida conhecida.

Não modificar arquivos do projeto.

---

### "/x-ray plan"

Criar plano de remediação.

Não modificar dependências.

O plano deve:

1. agrupar vulnerabilidades pelo pacote causador;
2. priorizar Critical;
3. depois High;
4. depois Medium;
5. identificar dependências diretas;
6. identificar dependências transitivas;
7. identificar quando "override" pode ser necessário;
8. identificar possíveis breaking changes;
9. identificar problemas provenientes da imagem;
10. identificar RPM;
11. identificar problemas sem versão corrigida;
12. evitar alterações desnecessárias.

O plano deve ser compacto.

Salvar em:

```
xray-out/plan.json
```

e atualizar:

```
xray-out/summary.md
```

---

## 15. CORREÇÕES EM GRUPOS

Nunca atualizar centenas de dependências simultaneamente sem necessidade.

Agrupar alterações relacionadas.

Exemplo:

```
Grupo 1: axios
Grupo 2: glob/tar/tmp
Grupo 3: ejs
Grupo 4: outras dependências
```

Depois de cada grupo:

```
alteração
↓
npm test
↓
npm build
↓
jf audit
```

Se aplicável:

```
docker build
↓
jf docker scan
```

Não necessariamente construir a imagem após cada pequeno grupo de dependências se isso for excessivamente caro. A estratégia deve otimizar tempo, mas sem perder segurança.

A skill deverá determinar quando um scan completo da imagem é necessário.

---

## 16. REGRA FUNDAMENTAL: PARAR AO FALHAR

Se qualquer alteração causar:

- `npm test` → FAIL
- `npm run build` → FAIL
- `jf audit` → regressão
- ou outra validação crítica falhar

**PARAR.**

Não continuar modificando outros grupos.

Atualizar:

```
state.json
summary.md
```

com:

```
status: blocked
```

e informar:

- alteração que causou o problema;
- comando que falhou;
- resumo do erro;
- próxima ação recomendada.

Não tentar corrigir automaticamente uma quebra complexa sem autorização/decisão da IA baseada nas regras da skill.

---

## 17. DEPENDÊNCIAS TRANSITIVAS

A skill deverá compreender a diferença entre:

**Dependência direta** — está declarada diretamente em `package.json`.

**Dependência transitiva** — é instalada por outra dependência.

Exemplo:

```
application
 └── library-A
      └── library-B
           └── glob
```

Se "glob" estiver vulnerável, não assumir que ele deve ser adicionado a `dependencies`.

Primeiro investigar a árvore.

Usar ferramentas apropriadas do npm para descobrir:

```
npm ls <package>
npm explain <package>
```

ou mecanismos equivalentes.

A skill deverá identificar:

- package
- current version
- required by
- dependency path
- direct/transitive
- fixed version

---

## 18. OVERRIDES

A skill deverá tratar "overrides" como uma solução específica para dependências transitivas.

Não adicionar automaticamente pacotes transitivos em "dependencies".

Antes de sugerir:

```json
"overrides": {
  "glob": "..."
}
```

investigar:

- quem depende de "glob";
- versão atual;
- versão vulnerável;
- versão corrigida;
- compatibilidade;
- se atualizar a dependência pai resolve naturalmente;
- se "override" é realmente necessário.

Quando o "override" for necessário, registrar:

- package
- dependency path
- reason
- current version
- forced version
- CVE

Não adicionar overrides sem justificativa.

---

## 19. BREAKING CHANGES

A skill nunca deverá assumir que "versão corrigida > versão atual" significa "atualizar imediatamente".

Deverá considerar:

- major version;
- breaking changes;
- compatibilidade;
- changelog quando disponível;
- API alterada;
- impacto provável;
- testes existentes.

Quando uma atualização representar risco (LOW / MEDIUM / HIGH), registrar no plano.

A IA deve preferir a menor alteração segura que resolva a vulnerabilidade sem introduzir risco desnecessário.

---

## 20. NÃO ATUALIZAR TUDO PARA A ÚLTIMA VERSÃO

A regra deve ser:

> «Corrigir vulnerabilidades com a menor alteração razoável e compatível.»

Não fazer `npm update` de maneira indiscriminada.

Não atualizar pacotes que não estejam relacionados à remediação sem justificativa.

---

## 21. BASELINE

Antes de qualquer alteração, criar uma baseline.

Registrar:

- branch
- git status
- package version state
- test status
- build status
- dependency vulnerabilities
- image vulnerabilities, se disponível
- lockfile hash

Exemplo:

```
BEFORE

Critical: 2
High: 14
Medium: 37

Tests: PASS
Build: PASS
Image: NOT SCANNED
Lockfile hash: ...
```

Depois das alterações, comparar.

---

## 22. NÃO PERMITIR REGRESSÃO

Se Critical antes: 0 e Critical depois: 1 → falhar.

Se High antes: 3 e High depois: 8 → falhar.

A skill deverá detectar regressões de segurança.

---

## 23. JFROG AUDIT

Utilizar o JFrog CLI instalado no ambiente.

O script deve detectar se `jf` está disponível.

Executar a auditoria de dependências usando formato estruturado sempre que possível.

Preferir JSON ou outro formato adequado para processamento automático.

Não depender exclusivamente de parsing de texto visual.

Filtrar e normalizar resultados.

A saída bruta deve ser armazenada em `xray-out/raw/` e a saída resumida em `xray-out/normalized/`.

---

## 24. SCAN DA IMAGEM

A skill deverá possuir uma etapa específica para a imagem Docker.

Fluxo:

```
Dockerfile
↓
docker build
↓
imagem local
↓
jf docker scan
↓
resultado
```

Não assumir que "jf audit = imagem segura".

A skill deve separar **DEPENDENCY SECURITY** de **IMAGE SECURITY**.

---

## 25. RPM

Quando uma vulnerabilidade estiver associada a RPM, não tentar resolvê-la alterando arbitrariamente `package.json`.

A skill deverá identificar:

- package
- version
- source
- image
- base image
- CVE
- fixed version

e classificar como `application dependency` ou `operating-system/image dependency`.

Se for problema da imagem base, a recomendação deverá considerar:

- atualização da imagem base;
- atualização da versão UBI;
- atualização do pacote do sistema;
- disponibilidade de imagem corrigida;
- impacto da mudança.

Não modificar "package.json" para resolver um problema que pertence à imagem.

---

## 26. UBI / IMAGEM BASE

Quando o projeto utilizar UBI ou outra imagem base, identificar explicitamente a imagem (ex: UBI9, UBI10).

Não alterar automaticamente a imagem base.

Primeiro:

1. identificar a imagem atual;
2. identificar a vulnerabilidade;
3. identificar a versão corrigida;
4. verificar se a correção está disponível em uma imagem mais nova;
5. avaliar compatibilidade;
6. propor a alteração;
7. somente aplicar quando apropriado.

Registrar isso no plano.

---

## 27. SHA / DIGEST

Quando o Xray apresentar identificadores como `sha256:...`, não assumir que isso seja uma versão npm.

Classificar corretamente se o identificador corresponde a: imagem, digest, artefato, camada, ou outro identificador.

Se não for possível determinar, marcar para investigação. Não inventar significado.

---

## 28. TESTES

A skill deverá identificar os comandos disponíveis no projeto.

Para Node/npm, considerar `npm test`, `npm run build` e outros scripts presentes no `package.json`.

Não assumir que todo projeto possui exatamente esses comandos.

Primeiro verificar `package.json → scripts`.

Executar somente comandos existentes/aplicáveis.

Registrar: PASS / FAIL / NOT_AVAILABLE / NOT_RUN.

---

## 29. BUILD

Executar build quando aplicável.

Não assumir `npm run build` sem verificar se existe.

O resultado deverá ser resumido. Logs completos ficam em `xray-out/raw/logs/`. A IA recebe apenas o resumo inicialmente.

---

## 30. DOCKER BUILD

Quando houver `Dockerfile`, a skill deverá ser capaz de realizar `docker build` com uma tag local previsível.

Não publicar a imagem automaticamente. Não fazer push da imagem. Não alterar registry.

A imagem deverá permanecer local para análise.

---

## 31. IMAGE SCAN

Executar o mecanismo apropriado da JFrog CLI para analisar a imagem local.

Separar o resultado em: application dependencies, OS/RPM packages, base image, other image components — quando possível.

---

## 32. VERIFY

O comando:

```
/x-ray verify
```

deverá realizar uma validação completa apropriada ao projeto.

Deverá verificar: dependencies, tests, build, docker build, image scan — quando aplicável.

O resultado deverá ser algo simples:

```
DEPENDENCIES     PASS
TESTS            PASS
BUILD            PASS
IMAGE BUILD      PASS
IMAGE SCAN       PASS

SECURITY STATUS: PASS
```

ou:

```
DEPENDENCIES     PASS
TESTS            PASS
BUILD            PASS
IMAGE BUILD      PASS
IMAGE SCAN       FAIL

SECURITY STATUS: BLOCKED
```

---

## 33. STATUS

Criar:

```
/x-ray status
```

Ele deverá ler `xray-out/state.json` e `xray-out/summary.md` e informar rapidamente:

```
Status: BLOCKED
Phase: image-scan
Last action: docker build
Next action: inspect RPM vulnerability
```

Não executar scans novamente.

---

## 34. RESUME

Criar:

```
/x-ray resume
```

Ele deverá utilizar a validação definida nos itens de estado e hash do lockfile.

Fluxo obrigatório:

```
ler state.json
↓
ler summary.md
↓
identificar fase
↓
identificar lockfile registrado
↓
git hash-object <lockfile>
↓
comparar com hash salvo
```

Se o hash for diferente:

```
STOP

Workspace changed since checkpoint.

Expected lockfile hash: ...
Current lockfile hash: ...

A new scan/baseline is required.
```

Não continuar automaticamente.

Se o hash for igual, continuar a validação normal de retomada.

---

## 35. DOCTOR

Criar:

```
/x-ray doctor
```

Verificar: JFrog CLI, Docker, Node, npm, Git, jq, autenticação/configuração necessária, package.json, Dockerfile, permissões, estrutura do projeto.

O resultado deve ser curto e objetivo.

Exemplo:

```
JFrog CLI       PASS
jq              PASS
Docker          PASS
Node            PASS
npm             PASS
Git             PASS
Authentication  PASS
package.json    PASS
Dockerfile      PASS

Environment: READY
```

Se uma ferramenta estiver ausente ou mal configurada, não instalar automaticamente.

Informar:

```
Tool missing/not configured: jq

Installation/configuration must be performed manually
according to the company's standard environment.

X-Ray cannot continue this operation.
```

---

## 36. REPORT

Criar:

```
/x-ray report
```

Gerar `xray-out/report.md` contendo:

- baseline;
- vulnerabilidades iniciais;
- vulnerabilidades finais;
- dependências alteradas;
- overrides adicionados;
- problemas de imagem;
- problemas RPM;
- testes;
- build;
- image scan;
- status final;
- pendências;
- observações.

Não inserir logs gigantescos no relatório.

---

## 37. TOKEN / CONTEXT MANAGEMENT

Essa é uma prioridade.

A skill deverá trabalhar com:

```
RAW
↓
NORMALIZED
↓
SUMMARY
```

A IA deverá acessar os dados nessa ordem. Primeiro `state.json` e `summary.md`. Depois `normalized/*.json`. Somente quando necessário `raw/*`.

Nunca enviar automaticamente logs completos, milhares de linhas, JSONs enormes, resultados duplicados, ou arquivos que não sejam relevantes.

A skill deve preferir "3 Critical, 12 High" em vez de transmitir todas as linhas da saída.

---

## 38. PLANO ANTES DE ALTERAÇÃO

Antes de qualquer alteração significativa, `/x-ray plan` deve criar um plano contendo: grupo, pacote, CVE, severidade, versão atual, versão alvo, tipo (direct/transitive/image/RPM), estratégia, risco, dependências afetadas.

Não modificar arquivos durante o "plan". Somente "apply" poderá modificar.

---

## 39. APPLY

Criar:

```
/x-ray apply
```

O comando deverá:

1. ler o plano;
2. verificar o estado;
3. escolher o próximo grupo;
4. aplicar somente as mudanças previstas;
5. executar testes;
6. executar build;
7. executar novo audit;
8. comparar resultados;
9. atualizar state;
10. atualizar summary;
11. avançar para o próximo grupo somente se tudo estiver OK.

Se falhar: STOP e marcar `status: blocked`.

---

## 40. NÃO CORRIGIR AUTOMATICAMENTE TUDO

O agente não deve executar uma atualização massiva.

Não fazer `npm update` automaticamente para centenas de dependências.

Não modificar dezenas de pacotes sem agrupamento.

Não adicionar dezenas de overrides sem análise.

Não atualizar imagem base sem avaliar impacto.

---

## 41. MODO INTERATIVO

Quando o usuário chamar `/x-ray`, mostrar:

```
X-Ray Security Assistant

1. Scan
2. Plan remediation
3. Apply remediation
4. Verify
5. Scan image
6. Report
7. Status
8. Resume
9. Doctor
```

Se o usuário já fornecer uma ação específica (`/x-ray scan`), não mostrar menu. Executar diretamente.

---

## 42. CLI

Criar uma CLI/script reutilizável.

O desenvolvedor deverá conseguir estar dentro de qualquer projeto e executar `xray scan` sem copiar scripts para o projeto.

O script deverá usar o diretório atual como workspace. Não exigir o nome do projeto quando isso puder ser evitado.

Exemplo:

```
cd meu-projeto
xray scan
```

deve analisar "meu-projeto". Se executado em outro projeto, deve analisar "outro-projeto".

A CLI deve localizar: `package.json`, `package-lock.json`, `Dockerfile`, configuração relevante, Git root quando necessário.

---

## 43. CAMINHO GLOBAL DOS SCRIPTS

Os scripts podem permanecer dentro de `skills/x-ray/scripts/` e serem chamados através de um launcher/CLI global.

Não copiar scripts para cada projeto.

Criar uma solução adequada para que o comando `xray` possa ser chamado a partir de qualquer projeto.

Se houver uma solução específica do ambiente atual, analisá-la antes de implementar.

Não assumir caminhos absolutos da máquina do usuário.

---

## 44. VS CODE — EXECUÇÃO

A integração com VS Code deve utilizar o `.vscode/tasks.json` definido anteriormente.

Todas as tarefas devem chamar exatamente o mesmo comando/script da CLI.

Não criar scripts separados para VS Code.

A saída deverá aparecer no terminal integrado do VS Code.

O desenvolvedor deve conseguir executar por clique: Scan, Plan, Apply, Verify, Status, Resume, Doctor, Report.

---

## 45. COMPATIBILIDADE COM OUTROS PROJETOS

Não criar a skill pensando exclusivamente no backend atual.

Ela deverá ser preparada para: frontend, backend, Node, npm, Docker, outros projetos quando possível.

Porém, não inventar suporte a tecnologias que não estejam implementadas.

Detectar o ambiente antes de executar.

---

## 46. SEGURANÇA DA AUTOMAÇÃO

A skill nunca deve:

- executar "git commit";
- executar "git push";
- criar branches;
- alterar histórico Git;
- publicar imagem;
- alterar registry;
- remover arquivos arbitrariamente;
- apagar o projeto;
- executar comandos destrutivos sem confirmação;
- substituir dependências indiscriminadamente;
- atualizar tudo para latest;
- instalar ferramentas automaticamente;
- baixar binários automaticamente.

Antes de qualquer operação potencialmente destrutiva, parar e solicitar confirmação.

---

## 47. IDEMPOTÊNCIA

Os scripts devem tentar ser idempotentes.

Se `/x-ray scan` for executado duas vezes, não deverá corromper resultados.

Se `/x-ray status` for executado, não deverá alterar o projeto.

Se `/x-ray plan` for executado novamente sem alterações relevantes, deverá atualizar o plano em vez de criar dezenas de cópias.

Evitar: `report-1.md`, `report-2.md`, `report-final.md`, `report-final-2.md`.

Manter arquivos previsíveis.

---

## 48. DETECÇÃO DE ESTADO DESATUALIZADO

Se o "state.json" disser que `tests = PASS` mas o projeto foi alterado depois da execução, a skill deverá detectar que o estado pode estar desatualizado.

A validação obrigatória do lockfile através de "git hash-object" deverá ser utilizada para essa finalidade sempre que o projeto possuir um lockfile aplicável.

Não confiar cegamente em resultados antigos. Se necessário, exigir nova verificação.

---

## 49. BASELINE E RESULTADO FINAL

Sempre comparar BEFORE vs AFTER. Mostrar:

```
Critical: 2 → 0
High: 14 → 2
Medium: 37 → 8

Tests: PASS → PASS
Build: PASS → PASS
Image: NOT_SCANNED → PASS
```

---

## 50. CRITÉRIO DE SUCESSO

Uma execução só poderá ser considerada "SECURITY PASS" quando todas as verificações aplicáveis forem concluídas com sucesso.

Não considerar somente "jf audit = 0" como sucesso completo.

Diferenciar "DEPENDENCY PASS" de "IMAGE PASS" e "FULL SECURITY PASS".

---

## 51. O BACKEND SERÁ O PRIMEIRO TESTE

Depois de implementar a skill, usar o backend atual como projeto piloto.

O backend já possui dependências sem vulnerabilidades e testes passando.

Portanto, o primeiro objetivo é verificar:

```
jf audit       → PASS
npm test       → PASS
npm build      → PASS
docker build   → PASS
jf docker scan → ???
```

O objetivo é descobrir as vulnerabilidades da imagem que ainda não foram analisadas.

Não modificar as dependências do backend novamente sem necessidade. Primeiro validar a imagem.

---

## 52. SOMENTE DEPOIS TESTAR O FRONTEND

Depois que a arquitetura funcionar corretamente no backend, aplicar a mesma metodologia no frontend.

Não criar uma segunda automação.

---

## 53. REUTILIZAÇÃO POR OUTROS DESENVOLVEDORES

A skill deverá ser documentada para que outro desenvolvedor consiga:

1. instalar/configurar os pré-requisitos manualmente, conforme o padrão da empresa;
2. disponibilizar o comando "xray";
3. entrar no projeto;
4. executar `xray doctor`;
5. executar `xray scan`;
6. executar `xray plan`;
7. executar `xray apply`;
8. executar `xray verify`.

A documentação deverá explicar somente o necessário.

---

## 54. NÃO PRESUMIR CONFIGURAÇÕES DA EMPRESA

Não inventar: URL do Artifactory, registry, credenciais, nomes de imagens, políticas do Xray, versão UBI, configurações específicas da pipeline.

Se uma informação for necessária e não estiver disponível no workspace, registrar como configuração necessária.

Preferir arquivos de configuração externos/variáveis de ambiente quando apropriado.

Nunca armazenar credenciais na skill.

---

## 55. QUALIDADE DO CÓDIGO

Os scripts devem:

- retornar códigos de saída apropriados;
- respeitar o contrato "--json";
- tratar erros;
- verificar pré-requisitos;
- produzir mensagens claras;
- não esconder erros;
- evitar saída desnecessária;
- separar stdout/stderr quando apropriado;
- funcionar em execução manual;
- permitir integração com VS Code através do "tasks.json";
- ser fáceis de manter.

---

## 56. NÃO IMPLEMENTAR TUDO DE UMA VEZ SEM VALIDAR

**IMPORTANTE:** antes de começar a editar os arquivos, faça uma análise da implementação atual.

Depois apresente um plano de implementação dividido em fases:

```
FASE 1  — Análise da skill existente
FASE 2  — Arquitetura proposta
FASE 3  — Core/CLI
FASE 4  — Dependency scan
FASE 5  — Normalization
FASE 6  — State + summary
FASE 7  — Plan
FASE 8  — Apply
FASE 9  — Verify
FASE 10 — Docker/Image scan
FASE 11 — Doctor
FASE 12 — Interactive mode
FASE 13 — VS Code tasks.json
FASE 14 — Documentação
FASE 15 — Teste real no backend
```

Não implemente antes de apresentar esse plano. Depois que o plano for apresentado, prossiga com a implementação.

---

## 57. REQUISITO FINAL DE COMUNICAÇÃO

Durante a execução pelo chat/agente, não despejar logs enormes.

Preferir:

```
[1/6] Dependency scan... PASS
[2/6] Normalize... PASS
[3/6] Tests... PASS
[4/6] Build... PASS
[5/6] Image build... PASS
[6/6] Image scan... FAIL

Critical: 1
High: 2

Reason:
1 RPM vulnerability in base image.

See:
xray-out/summary.md
```

Somente apresentar detalhes quando necessário.

Quando a execução for feita com "--json", respeitar exclusivamente o contrato JSON definido para scripts.

---

## 58. RESULTADO ESPERADO

Ao final, quero uma skill "/x-ray" que funcione como um especialista de segurança de dependências e imagens, mas que utilize scripts determinísticos para execução.

O fluxo principal deve ser:

```
/x-ray
    ↓
Scan
    ↓
Plan
    ↓
Apply por grupos
    ↓
Test
    ↓
Build
    ↓
Audit
    ↓
Image Build
    ↓
Image Scan
    ↓
Verify
    ↓
Report
```

Com estado persistente (`xray-out/state.json`), resumo humano (`xray-out/summary.md`), plano (`xray-out/plan.json`), relatório (`xray-out/report.md`), dados estruturados (`xray-out/normalized/`) e dados brutos (`xray-out/raw/`).

Com retomada segura baseada no hash do lockfile: `/x-ray status` e `/x-ray resume`.

Sem `git commit` / `git push`. Sem instalação automática de ferramentas.

Com um único contrato de saída para Chat, CLI e VS Code, e com `.vscode/tasks.json` para permitir a execução dos comandos principais diretamente pelo VS Code.

---

## 59. PRINCÍPIO MAIS IMPORTANTE

Não tente fazer a IA resolver todas as vulnerabilidades de uma vez.

A estratégia deverá ser:

```
IDENTIFICAR → AGRUPAR → PRIORIZAR → PLANEJAR → ALTERAR PEQUENO GRUPO
→ TESTAR → BUILD → SCAN → VALIDAR → PRÓXIMO GRUPO
```

Se algo quebrar:

```
STOP → REGISTRAR STATE → ATUALIZAR SUMMARY → INVESTIGAR → RESUME
```

Se o lockfile tiver sido alterado desde o checkpoint:

```
STOP → INFORMAR HASH ESPERADO → INFORMAR HASH ATUAL → NOVA BASELINE/SCAN
```

O objetivo não é simplesmente reduzir o número de CVEs.

O objetivo é chegar a:

```
SEGURANÇA + COMPATIBILIDADE + TESTES + BUILD + IMAGEM
+ RASTREABILIDADE + BAIXO CONSUMO DE CONTEXTO
```

sem criar uma automação excessivamente complexa.

---

## 60. INSTRUÇÃO FINAL PARA VOCÊ

Primeiro:

1. leia a skill "/x-ray" atual;
2. leia seus scripts;
3. leia suas regras;
4. leia sua estrutura atual de "xray-out";
5. identifique duplicações;
6. identifique funcionalidades que podem ser reaproveitadas;
7. identifique funcionalidades que devem ser removidas;
8. apresente a arquitetura proposta;
9. apresente o plano de implementação;
10. não modifique nenhum arquivo antes de apresentar esse plano.

Depois da validação, implemente a nova arquitetura.

Não simplesmente acrescente novas funcionalidades à arquitetura antiga.

O objetivo é reestruturar a skill, simplificar o que já existe e evitar que a nova versão fique ainda maior e mais complexa que a atual.

Priorize:

```
simplicidade + determinismo + segurança + baixo consumo de tokens
+ reutilização + manutenibilidade + capacidade de retomada
```

A implementação final deverá ser adequada para uso pessoal inicialmente e preparada para ser compartilhada futuramente com outros desenvolvedores.
