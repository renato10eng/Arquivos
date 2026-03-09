#!/usr/bin/env node

/**
 * ─────────────────────────────────────────────
 *  BUMP.JS — Gerenciador de versão interativo
 * ─────────────────────────────────────────────
 *
 *  INSTALAÇÃO (uma vez só):
 *
 *  1. Coloque esse arquivo numa pasta pessoal:
 *       ~/scripts/bump.js   (WSL/Linux/Mac)
 *
 *  2. Crie um alias no terminal:
 *       echo 'alias bump="node ~/scripts/bump.js"' >> ~/.bashrc
 *       source ~/.bashrc
 *
 *  3. Dentro de qualquer projeto, rode:
 *       bump
 *
 *  ⚠ NÃO sobe junto com o projeto — é só seu!
 */

const fs           = require('fs');
const path         = require('path');
const readline     = require('readline');
const { execSync } = require('child_process');

// ══════════════════════════════════════════════
//  ⚙️  CONFIGURAÇÕES PESSOAIS
// ══════════════════════════════════════════════
const CONFIG = {
  // URL do registry que lista as tags/versões do projeto
  // Artifactory ex: https://artifactory.empresa.com/artifactory/api/docker/REPO/v2/PROJETO/tags/list
  // Harbor ex:      https://harbor.empresa.com/api/v2.0/projects/PROJETO/repositories/REPO/artifacts
  registryUrl:  '',

  // Segunda URL opcional (caso fechadas e abertas fiquem em repos separados)
  registryUrl2: '',

  // Token de acesso (ou use variável de ambiente: export REGISTRY_TOKEN=seu_token)
  registryToken: process.env.REGISTRY_TOKEN || '',

  // Quantas versões mostrar na listagem (fechadas e abertas)
  versionsToShow: 3,

  // Sufixo que identifica versão aberta/candidata
  rcSuffix: 'rc',

  // Branches que bloqueiam push direto
  protectedBranches: ['main', 'master'],
};

// ══════════════════════════════════════════════
//  Cores ANSI
// ══════════════════════════════════════════════
const C = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  cyan:   '\x1b[36m',
  red:    '\x1b[31m',
  gray:   '\x1b[90m',
  white:  '\x1b[97m',
  bgBlue: '\x1b[44m',
};

const B  = t => C.bold   + t + C.reset;
const G  = t => C.green  + t + C.reset;
const Y  = t => C.yellow + t + C.reset;
const Cy = t => C.cyan   + t + C.reset;
const D  = t => C.dim    + t + C.reset;
const R  = t => C.red    + t + C.reset;

// ══════════════════════════════════════════════
//  Layout
// ══════════════════════════════════════════════
const WIDTH = 55;

function box(title) {
  const inner = ` ⚡ ${title} `;
  const pad   = WIDTH - inner.length - 2;
  console.log('┌' + '─'.repeat(WIDTH) + '┐');
  console.log('│' + inner + ' '.repeat(Math.max(0, pad)) + '│');
  console.log('└' + '─'.repeat(WIDTH) + '┘');
}

function line() {
  console.log(C.gray + '  ' + '─'.repeat(WIDTH - 2) + C.reset);
}

function header(pkg, branch, fromVer, toVer) {
  box('BUMP — Version Manager');
  console.log('');
  const name      = B(pkg.name || path.basename(process.cwd()));
  const branchStr = branch ? C.gray + '  ⎇  ' + branch + C.reset : '';
  const verStr    = toVer
    ? `  ${name}  ${D('•')}  ${Y(fromVer)} ${C.gray}→${C.reset} ${G(toVer)}`
    : `  ${name}  ${D('•')}  ${Y(fromVer)}`;
  console.log(verStr + branchStr);
  console.log('');
}

// ══════════════════════════════════════════════
//  Semver — comparação e manipulação própria
//  Não usa localeCompare para evitar inconsistência
// ══════════════════════════════════════════════

function parseBase(version) {
  const base = version.split('-')[0];
  return base.split('.').map(Number);
}

function parseSuffix(version) {
  const idx = version.indexOf('-');
  return idx === -1 ? '' : version.slice(idx + 1);
}

function semverCompare(a, b) {
  const pa = parseBase(a);
  const pb = parseBase(b);
  for (let i = 0; i < 3; i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na !== nb) return na > nb ? -1 : 1;
  }
  const sa = parseSuffix(a);
  const sb = parseSuffix(b);
  if (!sa && sb)  return -1;
  if (sa  && !sb) return 1;
  if (!sa && !sb) return 0;
  const numA = parseInt(sa.replace(/\D/g, '')) || 0;
  const numB = parseInt(sb.replace(/\D/g, '')) || 0;
  return numA > numB ? -1 : numA < numB ? 1 : 0;
}

function bumpBase(version, type) {
  const parts = parseBase(version);
  if (type === 'major')      { parts[0]++; parts[1] = 0; parts[2] = 0; }
  else if (type === 'minor') { parts[1]++; parts[2] = 0; }
  else                       { parts[2]++; }
  return parts.join('.');
}

function escapeRegex(str) {
  return str.replace(/\./g, '\\.');
}

/**
 * Calcula o próximo RC para uma base fechada específica.
 *
 * - base é sempre a versão FECHADA atual ex: "1.0.4"
 * - busca no registry todas que seguem "base-rc<número>" exato
 * - versões fora do padrão (xyz, beta, etc) são ignoradas na contagem
 * - mas a versão proposta é verificada contra o registry completo
 */
function nextRcForBase(allVersions, base) {
  const pattern = new RegExp(`^${escapeRegex(base)}-rc(\\d+)$`);
  const nums = allVersions
    .map(v => { const m = v.match(pattern); return m ? parseInt(m[1]) : null; })
    .filter(n => n !== null && !isNaN(n));
  const maxRc = nums.length ? Math.max(...nums) : 0;
  return `${base}-rc${maxRc + 1}`;
}

function versionExists(allVersions, version) {
  return allVersions.includes(version);
}

function closedBase(version) {
  return version.split('-')[0];
}

// ══════════════════════════════════════════════
//  Registry
// ══════════════════════════════════════════════
async function fetchFromUrl(url, token) {
  if (!url) return [];
  try {
    const header = token ? `-H "Authorization: Bearer ${token}"` : '';
    const raw    = execSync(
      `curl -s --max-time 8 ${header} "${url}"`,
      { stdio: ['pipe', 'pipe', 'pipe'] }
    ).toString().trim();
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (Array.isArray(data)) {
      return data.flatMap(a => {
        if (Array.isArray(a.tags)) return a.tags.map(t => t.name || t).filter(Boolean);
        if (typeof a === 'string') return [a];
        return [];
      });
    }
    if (data && Array.isArray(data.tags))    return data.tags.filter(Boolean);
    if (data && Array.isArray(data.results)) return data.results.filter(Boolean);
    return [];
  } catch {
    return [];
  }
}

async function fetchRemoteVersions() {
  const [v1, v2] = await Promise.all([
    fetchFromUrl(CONFIG.registryUrl,  CONFIG.registryToken),
    fetchFromUrl(CONFIG.registryUrl2, CONFIG.registryToken),
  ]);
  const all = [...new Set([...v1, ...v2])];
  return all.sort(semverCompare);
}

// ══════════════════════════════════════════════
//  package.json / package-lock.json
// ══════════════════════════════════════════════
function readPackage() {
  const pkgPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(pkgPath)) {
    console.log(R('\n  ✗ package.json não encontrado nessa pasta.'));
    console.log(D('  Rode dentro da pasta do projeto.\n'));
    process.exit(1);
  }
  try {
    return JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  } catch {
    console.log(R('\n  ✗ package.json com formato inválido.\n'));
    process.exit(1);
  }
}

function detectIndent(raw) {
  const match = raw.match(/^[\{\[]\n([\t ]+)/m);
  if (!match) return 2;
  if (match[1].startsWith('\t')) return '\t';
  return match[1].length;
}

function updatePackageJson(newVersion) {
  const pkgPath = path.join(process.cwd(), 'package.json');
  const raw     = fs.readFileSync(pkgPath, 'utf8');
  const parsed  = JSON.parse(raw);
  parsed.version = newVersion;
  const indent  = detectIndent(raw);
  fs.writeFileSync(pkgPath, JSON.stringify(parsed, null, indent) + '\n', 'utf8');
}

function updatePackageLock(newVersion) {
  const lockPath = path.join(process.cwd(), 'package-lock.json');
  if (!fs.existsSync(lockPath)) return false;
  try {
    const raw    = fs.readFileSync(lockPath, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed.version !== undefined) parsed.version = newVersion;
    if (parsed.packages?.['']?.version !== undefined) parsed.packages[''].version = newVersion;
    const indent = detectIndent(raw);
    fs.writeFileSync(lockPath, JSON.stringify(parsed, null, indent) + '\n', 'utf8');
    return true;
  } catch {
    return false;
  }
}

// ══════════════════════════════════════════════
//  Git
// ══════════════════════════════════════════════
function getBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { stdio: 'pipe' }).toString().trim();
  } catch { return ''; }
}

function isProtected(branch) {
  return CONFIG.protectedBranches.includes(branch);
}

function hasChanges() {
  try {
    const staged    = execSync('git diff --cached --name-only', { stdio: 'pipe' }).toString().trim();
    const unstaged  = execSync('git diff --name-only',          { stdio: 'pipe' }).toString().trim();
    const untracked = execSync('git ls-files --others --exclude-standard', { stdio: 'pipe' }).toString().trim();
    return !!(staged || unstaged || untracked);
  } catch { return false; }
}

function hasUpstream(branch) {
  try {
    execSync(`git rev-parse --abbrev-ref ${branch}@{upstream}`, { stdio: 'pipe' });
    return true;
  } catch { return false; }
}

// ══════════════════════════════════════════════
//  Input / Readline
// ══════════════════════════════════════════════
let rl;

function initReadline() {
  if (!rl) rl = readline.createInterface({ input: process.stdin, output: process.stdout });
}

function ask(question) {
  initReadline();
  return new Promise(resolve => rl.question(question, ans => resolve(ans.trim())));
}

function closeReadline() {
  if (rl) { rl.close(); rl = null; }
}

// ══════════════════════════════════════════════
//  Menu interativo com setas
// ══════════════════════════════════════════════
function menuSelect(options) {
  return new Promise((resolve) => {
    if (!process.stdin.isTTY) {
      options.forEach((opt, i) => console.log(`  ${i + 1}. ${opt.label}`));
      initReadline();
      rl.question('\n  Escolha o número: ', ans => {
        const idx = parseInt(ans) - 1;
        resolve(idx >= 0 && idx < options.length ? options[idx].value : '__back__');
      });
      return;
    }

    let selected = 0;

    function render(first = false) {
      if (!first) process.stdout.write('\x1b[' + options.length + 'A\x1b[0J');
      options.forEach((opt, i) => {
        if (i === selected) {
          console.log(`  ${C.bgBlue}${C.white} › ${opt.label.padEnd(WIDTH - 6)} ${C.reset}`);
        } else {
          console.log(`  ${C.gray}   ${opt.label}${C.reset}`);
        }
      });
    }

    render(true);

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    function handler(key) {
      if (key === '\u001b[A') {
        selected = (selected - 1 + options.length) % options.length;
        render();
      } else if (key === '\u001b[B') {
        selected = (selected + 1) % options.length;
        render();
      } else if (key === '\r' || key === '\n') {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.removeListener('data', handler);
        console.log('');
        resolve(options[selected].value);
      } else if (key === '\u001b') {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.removeListener('data', handler);
        console.log('');
        resolve('__back__');
      } else if (key === '\u0003') {
        process.stdin.setRawMode(false);
        console.log('\n');
        process.exit(0);
      }
    }

    process.stdin.on('data', handler);
  });
}

// ══════════════════════════════════════════════
//  TELA 1 — Seleção de versão
// ══════════════════════════════════════════════
async function telaVersao(pkg, branch, allVersions) {
  const current   = pkg.version;
  const baseAtual = closedBase(current);

  const fechadas = allVersions.filter(v => !parseSuffix(v));
  const abertas  = allVersions.filter(v =>  parseSuffix(v));
  const n        = CONFIG.versionsToShow;

  const nextFechada = bumpBase(baseAtual, 'patch');
  const nextAberta  = nextRcForBase(allVersions, baseAtual);
  const nextMinor   = bumpBase(baseAtual, 'minor');

  console.clear();
  header(pkg, branch, current);

  if (allVersions.length) {
    line();
    console.log(`  ${D('FECHADAS  (produção)')}`);
    fechadas.length
      ? fechadas.slice(0, n).forEach((v, i) =>
          console.log(`  ${i === 0 ? G('●') : D('○')} ${i === 0 ? B(v) + D('  ← atual') : D(v)}`)
        )
      : console.log(D('  nenhuma encontrada'));

    console.log('');
    console.log(`  ${D('ABERTAS  (desenvolvimento)')}`);
    abertas.length
      ? abertas.slice(0, n).forEach((v, i) =>
          console.log(`  ${i === 0 ? Y('●') : D('○')} ${i === 0 ? B(v) + D('  ← atual') : D(v)}`)
        )
      : console.log(D('  nenhuma encontrada'));
  } else {
    line();
    console.log(D('  Registry não configurado — usando apenas package.json local'));
  }

  line();
  console.log(`  ${B('NOVA VERSÃO')}\n`);

  const escolha = await menuSelect([
    { label: `FECHADA    release estável      →  ${nextFechada}`, value: 'fechada' },
    { label: `ABERTA     release candidata    →  ${nextAberta}`,  value: 'aberta'  },
    { label: `EVOLUÇÃO   minor                →  ${nextMinor}`,   value: 'minor'   },
    { label: `GUARDAR    só commit/push       sem trocar versão`,  value: 'guardar' },
    { label: `CUSTOM     digitar versão`,                          value: 'custom'  },
  ]);

  if (escolha === '__back__') return null;

  if (escolha === 'guardar') return { newVersion: null, tipo: 'guardar' };

  if (escolha === 'custom') {
    const v = await ask('\n  Digite a versão desejada: ');
    if (!v) return null;
    if (versionExists(allVersions, v)) {
      console.log(`\n  ${Y('⚠')}  Versão ${B(v)} já existe no registry!`);
      const ok = await ask('  Continuar mesmo assim? (s/N): ');
      if (ok.toLowerCase() !== 's') return null;
    }
    return { newVersion: v, tipo: 'custom' };
  }

  const map    = { fechada: nextFechada, aberta: nextAberta, minor: nextMinor };
  const chosen = map[escolha];

  if (versionExists(allVersions, chosen)) {
    console.log(`\n  ${Y('⚠')}  Versão ${B(chosen)} já existe no registry!`);
    const ok = await ask('  Continuar mesmo assim? (s/N): ');
    if (ok.toLowerCase() !== 's') return null;
  }

  return { newVersion: chosen, tipo: escolha };
}

// ══════════════════════════════════════════════
//  TELA 2 — Ação de git
// ══════════════════════════════════════════════
async function telaAcao(pkg, branch, current, newVersion) {
  console.clear();
  header(pkg, branch, current, newVersion);
  line();
  console.log(`  ${B('AÇÃO DE GIT')}\n`);

  return await menuSelect([
    { label: 'atualizar versão + commit + push', value: 'push'     },
    { label: 'atualizar versão + commit',        value: 'commit'   },
    { label: 'atualizar versão apenas',          value: 'local'    },
    { label: '← voltar',                         value: '__back__' },
  ]);
}

// ══════════════════════════════════════════════
//  TELA 3 — Tipo de commit
// ══════════════════════════════════════════════
async function telaCommit(pkg, branch, current, newVersion) {
  console.clear();
  header(pkg, branch, current, newVersion);
  line();
  console.log(`  ${B('TIPO DE COMMIT')}\n`);

  const escolha = await menuSelect([
    { label: 'release     versão estável pronta',   value: 'release'  },
    { label: 'estável     funcionando, incompleto', value: 'estavel'  },
    { label: 'parcial     funcional em partes',     value: 'parcial'  },
    { label: 'wip         guardando alterações',    value: 'wip'      },
    { label: 'fix         correção de bug',         value: 'fix'      },
    { label: 'refactor    reorganização de código', value: 'refactor' },
    { label: 'custom      escrever mensagem',       value: 'custom'   },
    { label: '← voltar',                            value: '__back__' },
  ]);

  if (escolha === '__back__') return null;

  if (escolha === 'custom') {
    const msg = await ask('\n  Mensagem de commit: ');
    return msg || null;
  }

  const ver = newVersion || '';
  const msgMap = {
    release:  `release: v${ver}`,
    estavel:  `chore: v${ver} estável até aqui`,
    parcial:  `chore: v${ver} funcional parcial`,
    wip:      `chore: wip — guardando alterações`,
    fix:      `fix: v${ver}`,
    refactor: `refactor: v${ver}`,
  };

  return msgMap[escolha];
}

// ══════════════════════════════════════════════
//  TELA 4 — Confirmação + Execução + Resultado
// ══════════════════════════════════════════════
async function telaConfirmar(pkg, branch, current, newVersion, commitMsg, acao) {
  const acaoLabel = {
    push:   'commit + push',
    commit: 'somente commit',
    local:  'atualizar versão apenas',
  };

  console.clear();
  header(pkg, branch, current, newVersion || current);
  line();
  console.log(`  ${B('CONFIRMAR ALTERAÇÃO')}\n`);
  console.log(`  Projeto   ${B(pkg.name || path.basename(process.cwd()))}`);
  console.log(`  Branch    ${branch     || D('não detectada')}`);
  console.log(`  Versão    ${newVersion ? Y(current) + ' → ' + G(newVersion) : D('sem alteração')}`);
  if (commitMsg) console.log(`  Commit    ${Cy(commitMsg)}`);
  console.log(`  Ação      ${acaoLabel[acao] || acao}`);
  console.log('');
  line();
  console.log('');

  const ok = await menuSelect([
    { label: 'confirmar', value: 'ok'       },
    { label: 'voltar',    value: '__back__' },
    { label: 'cancelar',  value: 'cancel'  },
  ]);

  if (ok !== 'ok') return ok;

  // ── Execução ──────────────────────────────
  const start       = Date.now();
  let lockUpdated   = false;
  let committed     = false;
  let pushed        = false;
  let blocked       = false;
  let pushError     = '';

  console.clear();
  header(pkg, branch, current, newVersion || current);
  line();
  console.log(`  ${B('EXECUTANDO')}\n`);

  // 1. Atualiza arquivos
  if (newVersion) {
    updatePackageJson(newVersion);
    console.log('  ' + G('✓') + '  package.json atualizado');
    lockUpdated = updatePackageLock(newVersion);
    if (lockUpdated) console.log('  ' + G('✓') + '  package-lock.json atualizado');
  }

  // 2. Commit
  if (acao === 'commit' || acao === 'push') {
    if (!hasChanges()) {
      console.log('  ' + Y('⚠') + '  nenhuma alteração detectada para commitar');
    } else {
      try {
        execSync('git add .', { stdio: 'pipe' });
        execSync(`git commit -m "${commitMsg}"`, { stdio: 'pipe' });
        committed = true;
        console.log('  ' + G('✓') + '  commit criado');
      } catch (e) {
        console.log('  ' + R('✗') + '  erro no commit: ' + e.message.split('\n')[0]);
      }
    }
  }

  // 3. Push
  if (acao === 'push') {
    if (isProtected(branch)) {
      blocked = true;
      console.log('');
      console.log(`  ${Y('⚠')}  ${B('BRANCH PROTEGIDA')} — push bloqueado`);
      console.log(`  Você está em: ${R(branch)}`);
      console.log('');
      line();
      console.log('');

      const opcao = await menuSelect([
        { label: 'manter como está (commit já feito)', value: 'keep'   },
        { label: 'desfazer tudo',                      value: 'undo'   },
        { label: 'cancelar',                           value: 'cancel' },
      ]);

      if (opcao === 'undo') {
        try {
          if (committed)  execSync('git reset HEAD~1', { stdio: 'pipe' });
          if (newVersion) {
            updatePackageJson(current);
            if (lockUpdated) updatePackageLock(current);
          }
          console.log('\n  ' + Y('↩') + '  tudo desfeito\n');
        } catch {
          console.log('\n  ' + R('✗') + '  erro ao desfazer\n');
        }
        return 'done';
      }

    } else if (committed) {
      try {
        if (!hasUpstream(branch)) {
          execSync(`git push --set-upstream origin ${branch}`, { stdio: 'pipe' });
        } else {
          execSync('git push', { stdio: 'pipe' });
        }
        pushed = true;
        console.log('  ' + G('✓') + `  push realizado → ${Cy('origin/' + branch)}`);
      } catch (e) {
        pushError = e.message.split('\n').find(l => l.trim()) || e.message;
        console.log('  ' + R('✗') + '  erro no push: ' + pushError);
      }
    }
  }

  // ── Resultado final ───────────────────────
  const elapsed = ((Date.now() - start) / 1000).toFixed(1) + 's';

  console.log('');
  line();
  console.log('');
  console.log(`  ${G('✔')}  ${B('OPERAÇÃO CONCLUÍDA')}\n`);
  console.log(`  Projeto   ${B(pkg.name || path.basename(process.cwd()))}`);
  console.log(`  Branch    ${branch || D('—')}`);
  if (newVersion)               console.log(`  Versão    ${G(newVersion)}`);
  if (commitMsg && acao !== 'local') console.log(`  Commit    ${Cy(commitMsg)}`);
  if (pushed)                   console.log(`  Push      ${Cy('origin/' + branch)}`);
  if (blocked)                  console.log(`  Push      ${Y('bloqueado — branch protegida')}`);
  if (pushError)                console.log(`  Push      ${R('falhou — ' + pushError)}`);
  console.log(`  Tempo     ${D(elapsed)}`);
  console.log('');

  return 'done';
}

// ══════════════════════════════════════════════
//  MAIN
// ══════════════════════════════════════════════
async function main() {
  console.clear();

  const pkg    = readPackage();
  const branch = getBranch();

  let allVersions = [];
  if (CONFIG.registryUrl || CONFIG.registryUrl2) {
    process.stdout.write(D('  Conectando ao registry...\r'));
    allVersions = await fetchRemoteVersions();
    process.stdout.write('\x1b[K');
  }

  let step = 1;
  let versaoResult, acaoResult, commitMsg;

  while (true) {

    if (step === 1) {
      versaoResult = await telaVersao(pkg, branch, allVersions);
      if (!versaoResult) { console.log(D('\n  Cancelado.\n')); break; }
      step = 2;
    }

    if (versaoResult.tipo === 'guardar') {
      if (step === 2) {
        acaoResult = await telaAcao(pkg, branch, pkg.version, null);
        if (acaoResult === '__back__') { step = 1; continue; }
        if (acaoResult === 'local')   { console.log(D('\n  Nada alterado.\n')); break; }
        commitMsg = 'chore: wip — guardando alterações';
        step = 4;
      }
    } else {
      if (step === 2) {
        acaoResult = await telaAcao(pkg, branch, pkg.version, versaoResult.newVersion);
        if (acaoResult === '__back__') { step = 1; continue; }
        if (acaoResult === 'local') { commitMsg = null; step = 4; }
        else step = 3;
      }

      if (step === 3) {
        commitMsg = await telaCommit(pkg, branch, pkg.version, versaoResult.newVersion);
        if (commitMsg === null) { step = 2; continue; }
        step = 4;
      }
    }

    if (step === 4) {
      const r = await telaConfirmar(
        pkg, branch, pkg.version,
        versaoResult.newVersion,
        commitMsg,
        acaoResult
      );
      if (r === '__back__') { step = versaoResult.tipo === 'guardar' ? 2 : 3; continue; }
      break;
    }
  }

  closeReadline();
}

main().catch(err => {
  closeReadline();
  if (process.stdin.isTTY) {
    try { process.stdin.setRawMode(false); } catch {}
  }
  console.error(R('\n  Erro inesperado: ' + err.message + '\n'));
  process.exit(1);
});
