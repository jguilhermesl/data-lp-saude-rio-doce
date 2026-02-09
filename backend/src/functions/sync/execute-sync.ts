import { Request, Response } from 'express';
import { spawn } from 'child_process';
import { join } from 'path';
import { env } from '@/env';

/**
 * Interface para resultado de execução
 */
interface ExecutionResult {
  scriptName: string;
  success: boolean;
  duration: number;
  error?: string;
  output?: string;
}

/**
 * Determina o comando e caminho correto baseado no ambiente
 */
function getScriptConfig(scriptPath: string) {
  const isProduction = env.NODE_ENV === 'production';
  
  if (isProduction) {
    // Em produção, usar node e arquivos compilados em dist/
    const compiledPath = scriptPath.replace('src/', 'dist/').replace('.ts', '.js');
    return {
      command: 'node',
      path: compiledPath,
      cwd: join(__dirname, '../../..'), // Em produção, estamos em dist/functions/sync, volta para backend/
    };
  } else {
    // Em desenvolvimento, usar tsx e arquivos TypeScript em src/
    return {
      command: 'tsx',
      path: scriptPath,
      cwd: join(__dirname, '../../..'), // Em dev, estamos em src/functions/sync, volta para backend/
    };
  }
}

/**
 * Executa um script de importação
 */
function executeImportScript(scriptPath: string, scriptName: string): Promise<ExecutionResult> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const config = getScriptConfig(scriptPath);
    
    const child = spawn(config.command, [config.path], {
      cwd: config.cwd,
      stdio: 'pipe',
    });

    let output = '';
    let errorOutput = '';

    // Capturar stdout
    child.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
    });

    // Capturar stderr
    child.stderr.on('data', (data) => {
      const text = data.toString();
      errorOutput += text;
    });

    // Quando o processo terminar
    child.on('close', (code) => {
      const duration = Date.now() - startTime;

      if (code === 0) {
        resolve({
          scriptName,
          success: true,
          duration,
          output,
        });
      } else {
        resolve({
          scriptName,
          success: false,
          duration,
          error: errorOutput || `Exit code: ${code}`,
          output,
        });
      }
    });
  });
}

/**
 * Executa um único script
 */
async function executeSequential(script: { path: string; name: string }): Promise<ExecutionResult> {
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
 * Executa a sincronização completa de dados
 */
export async function executeSync(req: Request, res: Response) {
  const startTime = Date.now();
  const results: ExecutionResult[] = [];
  let hasErrors = false;

  try {
    // ============================================
    // FASE 1: Importações Base (Sequencial)
    // ============================================
    const phase1Scripts = [
      { path: 'src/scripts/import-specialties.ts', name: 'import-specialties' },
      { path: 'src/scripts/import-doctors.ts', name: 'import-doctors' },
      { path: 'src/scripts/import-patients.ts', name: 'import-patients' },
      { path: 'src/scripts/import-procedures.ts', name: 'import-procedures' },
    ];

    // Executar sequencialmente para evitar problemas de conexão
    for (const script of phase1Scripts) {
      const result = await executeSequential(script);
      results.push(result);
      
      if (!result.success) {
        hasErrors = true;
        // Abortar fases seguintes se houver erro na Fase 1
        throw new Error(`Erro na Fase 1: ${script.name}`);
      }
    }

    // ============================================
    // FASE 2: Relacionamento Médico-Especialidade
    // ============================================
    const phase2Result = await executeSequential({
      path: 'src/scripts/import-doctor-specialties.ts',
      name: 'import-doctor-specialties',
    });
    results.push(phase2Result);

    if (!phase2Result.success) {
      hasErrors = true;
      // Continua para Fase 3 mesmo com erro (seguindo lógica do sync-all.ts)
    }

    // ============================================
    // FASE 3: Atendimentos
    // ============================================
    const phase3Result = await executeSequential({
      path: 'src/scripts/import-appointments.ts',
      name: 'import-appointments',
    });
    results.push(phase3Result);

    if (!phase3Result.success) {
      hasErrors = true;
      // Continua para Fase 4 mesmo com erro (seguindo lógica do sync-all.ts)
    }

    // ============================================
    // FASE 4: Relacionamentos Appointment-Procedimentos
    // ============================================
    const phase4Result = await executeSequential({
      path: 'src/scripts/import-appointment-procedures.ts',
      name: 'import-appointment-procedures',
    });
    results.push(phase4Result);

    if (!phase4Result.success) {
      hasErrors = true;
    }

    // ============================================
    // RESPOSTA
    // ============================================
    const totalDuration = Date.now() - startTime;
    
    const response = {
      success: !hasErrors,
      message: hasErrors 
        ? 'Sincronização concluída com erros' 
        : 'Sincronização concluída com sucesso',
      statistics: {
        totalScripts: results.length,
        successCount: results.filter(r => r.success).length,
        failureCount: results.filter(r => !r.success).length,
        totalDuration: formatDuration(totalDuration),
        totalDurationMs: totalDuration,
      },
      scripts: results.map(result => ({
        name: result.scriptName,
        success: result.success,
        duration: formatDuration(result.duration),
        durationMs: result.duration,
        error: result.error,
      })),
    };

    return res.status(hasErrors ? 500 : 200).json(response);
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    
    return res.status(500).json({
      success: false,
      message: 'Erro fatal durante a sincronização',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      statistics: {
        totalScripts: results.length,
        successCount: results.filter(r => r.success).length,
        failureCount: results.filter(r => !r.success).length,
        totalDuration: formatDuration(totalDuration),
        totalDurationMs: totalDuration,
      },
      scripts: results.map(result => ({
        name: result.scriptName,
        success: result.success,
        duration: formatDuration(result.duration),
        durationMs: result.duration,
        error: result.error,
      })),
    });
  }
}
