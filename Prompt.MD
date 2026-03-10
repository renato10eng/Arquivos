Contexto geral:
Existe um script Node.js chamado bump.js que gerencia versões 
de projetos de forma interativa no terminal. Ele lê o 
package.json do projeto atual, sugere próximas versões, 
permite escolher tipo de commit e executa git add, commit 
e push. O script roda localmente no WSL e é acionado por 
um botão no VS Code via extensão Task Buttons 
(spencerwmiles.vscode-task-buttons) configurada no 
tasks.json e settings.json.

---

Problema 1 — Botão abre seletor em vez de executar direto

Atualmente ao clicar no botão na barra de status do VS Code, 
ele abre uma janela de seleção de tasks em vez de executar 
diretamente. O ideal é que ao clicar no botão o terminal 
já abra e o script já comece a rodar sem nenhuma etapa 
intermediária.

Verifique no tasks.json se há alguma configuração faltando 
para execução direta. A extensão Task Buttons suporta 
execução direta via propriedade no settings.json. 
Avalie e corrija conforme o projeto.

---

Problema 2 — Terminal exibe caracteres e comandos 
antes do menu do script

Ao rodar o script pelo botão, aparecem vários caracteres, 
o comando executado e saídas do shell antes de o menu 
interativo do script aparecer. O terminal deveria mostrar 
apenas a saída do próprio script limpa desde o início.

Possíveis causas:
- O .bashrc está imprimindo algo ao ser carregado
- O VS Code está exibindo o comando executado antes da saída
- O shell está sendo iniciado como login shell carregando 
  arquivos desnecessários

Verifique o tasks.json, especialmente as propriedades 
presentation e options.shell. Avalie se faz sentido usar 
echo off ou equivalente para suprimir o comando antes 
da saída. Corrija conforme o projeto sem quebrar 
a execução no WSL.

---

Problema 3 — Script sempre usa o diretório do projeto 
errado quando há múltiplos projetos abertos

O script usa process.cwd() para detectar em qual projeto 
está rodando. Porém quando o botão é clicado, o VS Code 
executa a task usando o diretório do workspace que tem 
o tasks.json configurado, ignorando qual terminal ou 
pasta está ativa no momento.

O comportamento esperado é que o script sempre rode no 
diretório do terminal ativo no momento do clique, ou seja, 
onde o usuário está trabalhando naquele momento.

Avalie as seguintes abordagens e implemente a que fizer 
mais sentido para o projeto:

Opção A — Usar a variável ${workspaceFolder} no tasks.json
apontando para o diretório correto dinamicamente.

Opção B — Passar o diretório atual como argumento para 
o script e usar process.argv para receber esse caminho 
em vez de process.cwd().

Opção C — Configurar o tasks.json com cwd apontando para 
o terminal ativo usando variáveis do VS Code disponíveis.

Escolha a abordagem mais robusta e que não quebre 
o funcionamento quando apenas um projeto estiver aberto.

---

Problema 4 — Registry API com autenticação HTTP Basic 
(janela de alerta do browser)

A API do registry exige autenticação HTTP Basic, aquela 
janela nativa que o browser exibe pedindo usuário e senha. 
Atualmente o script tem os campos registryUrl e 
registryToken no CONFIG mas não consegue autenticar 
nesse modelo.

O objetivo é nunca expor senha diretamente no código.

Avalie e implemente a seguinte abordagem se fizer sentido:

- Verificar se o registry suporta tokens de acesso pessoal 
  gerados nas configurações do perfil do usuário, que 
  funcionam como substitutos da senha no HTTP Basic Auth 
  no formato usuario:token passados via header Authorization.

- Se o registry for Artifactory, JFrog ou Harbor, 
  verificar como gerar esse token pessoal e documentar 
  no próprio CONFIG do script como comentário explicando 
  onde gerar e como usar.

- O token deve ser lido de variável de ambiente 
  REGISTRY_TOKEN já existente no script, nunca hardcoded.

- Se a autenticação Basic for necessária, implementar 
  suporte a passar usuario e token via variáveis de ambiente 
  separadas: REGISTRY_USER e REGISTRY_TOKEN, montando o 
  header Authorization: Basic com base64 desses dois valores.

Implemente somente o que fizer sentido e não quebrar 
o restante do script.

---

Instruções gerais para todas as correções:

- Analise o código existente antes de qualquer alteração
- Só implemente o que realmente fizer sentido para 
  o projeto como ele está
- Não quebre funcionalidades que já estão funcionando
- O script roda no WSL via terminal do VS Code
- Não adicione dependências externas — apenas módulos 
  nativos do Node.js
- Mantenha o estilo visual e a estrutura de telas 
  já existente no script
- Se alguma correção sugerida aqui conflitar com 
  o código real, prefira a solução que funcione 
  corretamente no contexto do projeto