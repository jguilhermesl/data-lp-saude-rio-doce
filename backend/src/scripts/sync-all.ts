import { spawn } from 'child_process';
import { join } from 'path';

/**
 * Cores para o console
 */
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

/**
 * Interface para resultado de execução
 */
interface ExecutionResult {
  scriptName: string;
  success: boolean;
  duration: number;
  error?: string;
}

/**
 * Executa um script de importação
 */
function executeImportScript(scriptPath: string, scriptName: string): Promise<ExecutionResult> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    console.log(`${colors.cyan}▶${colors.reset} Iniciando: ${colors.bright}${scriptName}${colors.reset}`);
    
    const child = spawn('tsx', [scriptPath], {
      cwd: join(__dirname, '../..'),
      stdio: 'pipe',
    });

    let output = '';
    let errorOutput = '';

    // Capturar stdout
    child.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      // Mostrar output em tempo real com prefixo
      process.stdout.write(`  ${colors.blue}[${scriptName}]${colors.reset} ${text}`);
    });

    // Capturar stderr
    child.stderr.on('data', (data) => {
      const text = data.toString();
      errorOutput += text;
      process.stderr.write(`  ${colors.yellow}[${scriptName}]${colors.reset} ${text}`);
    });

    // Quando o processo terminar
    child.on('close', (code) => {
      const duration = Date.now() - startTime;
      const durationSec = (duration / 1000).toFixed(2);

      if (code === 0) {
        console.log(`${colors.green}✓${colors.reset} ${colors.bright}${scriptName}${colors.reset} concluído em ${durationSec}s\n`);
        resolve({
          scriptName,
          success: true,
          duration,
        });
      } else {
        console.log(`${colors.red}✗${colors.reset} ${colors.bright}${scriptName}${colors.reset} falhou após ${durationSec}s\n`);
        resolve({
          scriptName,
          success: false,
          duration,
          error: errorOutput || `Exit code: ${code}`,
        });
      }
    });
  });
}

/**
 * Executa múltiplos scripts em paralelo
 */
async function executeParallel(scripts: Array<{ path: string; name: string }>): Promise<ExecutionResult[]> {
  console.log(`${colors.magenta}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}Executando ${scripts.length} script(s) em paralelo...${colors.reset}`);
  console.log(`${colors.magenta}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  const promises = scripts.map((script) => executeImportScript(script.path, script.name));
  return Promise.all(promises);
}

/**
 * Executa um único script
 */
async function executeSequential(script: { path: string; name: string }): Promise<ExecutionResult> {
  console.log(`${colors.magenta}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}Executando: ${script.name}${colors.reset}`);
  console.log(`${colors.magenta}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  return executeImportScript(script.path, script.name);
}

/**
 * Formata duração em tempo legível
 */
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${seconds}s`;
}

/**
 * Script principal de sincronização
 */
async function syncAll() {
  const startTime = Date.now();

  console.log('\n');
  console.log(`${colors.cyan}╔═══════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║${colors.reset}  ${colors.bright}🚀 SINCRONIZAÇÃO COMPLETA DE DADOS${colors.reset}               ${colors.cyan}║${colors.reset}`);
  console.log(`${colors.cyan}╚═══════════════════════════════════════════════════════╝${colors.reset}`);
  console.log('\n');

  const results: ExecutionResult[] = [];
  let hasErrors = false;

  try {
    // ============================================
    // FASE 1: Importações Base (Paralelo - OTIMIZADO)
    // ============================================
    console.log(`${colors.yellow}📦 FASE 1: Importações Base${colors.reset}\n`);
    console.log(`${colors.cyan}⚡ Executando em PARALELO para melhor performance${colors.reset}\n`);
    
    const phase1Scripts = [
      { path: 'src/scripts/import-specialties.ts', name: 'import-specialties' },
      { path: 'src/scripts/import-doctors.ts', name: 'import-doctors' },
      { path: 'src/scripts/import-patients.ts', name: 'import-patients' },
      { path: 'src/scripts/import-procedures.ts', name: 'import-procedures' },
    ];

    // Executar em PARALELO - estas importações são independentes
    const phase1Results = await executeParallel(phase1Scripts);
    results.push(...phase1Results);
    
    // Verificar se houve erros na Fase 1
    const phase1Errors = phase1Results.filter(r => !r.success);
    if (phase1Errors.length > 0) {
      hasErrors = true;
      console.log(`${colors.red}⚠️  ${phase1Errors.length} erro(s) na Fase 1. Abortando fases seguintes.${colors.reset}\n`);
      phase1Errors.forEach(err => {
        console.log(`${colors.red}   • ${err.scriptName}: ${err.error}${colors.reset}`);
      });
      throw new Error(`Erros na Fase 1: ${phase1Errors.map(e => e.scriptName).join(', ')}`);
    }

    // ============================================
    // FASE 2: Relacionamento Médico-Especialidade
    // ============================================
    console.log(`${colors.yellow}📦 FASE 2: Relacionamentos Médico-Especialidade${colors.reset}\n`);
    
    const phase2Result = await executeSequential({
      path: 'src/scripts/import-doctor-specialties.ts',
      name: 'import-doctor-specialties',
    });
    results.push(phase2Result);

    if (!phase2Result.success) {
      hasErrors = true;
      console.log(`${colors.red}⚠️  Erro na Fase 2. Continuando para Fase 3...${colors.reset}\n`);
    }

    // ============================================
    // FASE 3: Atendimentos (depende de médicos e pacientes)
    // ============================================
    console.log(`${colors.yellow}📦 FASE 3: Atendimentos${colors.reset}\n`);
    
    const phase3Result = await executeSequential({
      path: 'src/scripts/import-appointments.ts',
      name: 'import-appointments',
    });
    results.push(phase3Result);

    if (!phase3Result.success) {
      hasErrors = true;
      console.log(`${colors.red}⚠️  Erro na Fase 3. Continuando para Fase 4...${colors.reset}\n`);
    }

    // ============================================
    // FASE 4: Relacionamentos Appointment-Procedimentos
    // ============================================
    console.log(`${colors.yellow}📦 FASE 4: Relacionamentos Appointment-Procedimentos${colors.reset}\n`);
    
    const phase4Result = await executeSequential({
      path: 'src/scripts/import-appointment-procedures.ts',
      name: 'import-appointment-procedures',
    });
    results.push(phase4Result);

    if (!phase4Result.success) {
      hasErrors = true;
    }

    // ============================================
    // RESUMO FINAL
    // ============================================
    const totalDuration = Date.now() - startTime;
    
    console.log('\n');
    console.log(`${colors.cyan}╔═══════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.cyan}║${colors.reset}  ${colors.bright}📊 RESUMO DA SINCRONIZAÇÃO${colors.reset}                       ${colors.cyan}║${colors.reset}`);
    console.log(`${colors.cyan}╚═══════════════════════════════════════════════════════╝${colors.reset}`);
    console.log('\n');

    console.log(`${colors.bright}Scripts executados:${colors.reset}\n`);
    
    results.forEach((result) => {
      const status = result.success 
        ? `${colors.green}✓ SUCESSO${colors.reset}` 
        : `${colors.red}✗ FALHOU${colors.reset}`;
      const duration = formatDuration(result.duration);
      console.log(`  ${status}  ${result.scriptName.padEnd(30)} (${duration})`);
    });

    console.log('\n');
    console.log(`${colors.bright}Estatísticas:${colors.reset}`);
    console.log(`  • Total de scripts: ${results.length}`);
    console.log(`  • Sucesso: ${colors.green}${results.filter(r => r.success).length}${colors.reset}`);
    console.log(`  • Falhas: ${colors.red}${results.filter(r => !r.success).length}${colors.reset}`);
    console.log(`  • Tempo total: ${colors.cyan}${formatDuration(totalDuration)}${colors.reset}`);
    console.log('\n');

    if (hasErrors) {
      console.log(`${colors.red}⚠️  Sincronização concluída com erros!${colors.reset}\n`);
      process.exit(1);
    } else {
      console.log(`${colors.green}✅ Sincronização concluída com sucesso!${colors.reset}\n`);
      process.exit(0);
    }
  } catch (error) {
    console.error(`${colors.red}❌ Erro fatal durante a sincronização:${colors.reset}`, error);
    
    // Mostrar resumo parcial
    if (results.length > 0) {
      console.log('\n');
      console.log(`${colors.yellow}📊 Scripts executados antes do erro:${colors.reset}\n`);
      results.forEach((result) => {
        const status = result.success 
          ? `${colors.green}✓${colors.reset}` 
          : `${colors.red}✗${colors.reset}`;
        console.log(`  ${status} ${result.scriptName}`);
      });
    }
    
    console.log('\n');
    process.exit(1);
  }
}

// Executar sincronização
syncAll();
