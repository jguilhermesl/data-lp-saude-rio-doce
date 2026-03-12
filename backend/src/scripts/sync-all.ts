import { runSyncAllLogic } from "../functions/sync/execute-sync";

/**
 * Cores para o console
 */
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
};

async function main() {
  console.log("\n");
  console.log(
    `${colors.cyan}╔═══════════════════════════════════════════════════════╗${colors.reset}`,
  );
  console.log(
    `${colors.cyan}║${colors.reset}   ${colors.bright} INICIANDO SYNC ALL (TERMINAL LOCAL)${colors.reset}         ${colors.cyan}║${colors.reset}`,
  );
  console.log(
    `${colors.cyan}╚═══════════════════════════════════════════════════════╝${colors.reset}\n`,
  );

  try {
    // Chamamos a mesma lógica que a rota da API utiliza
    const { results, totalDuration, hasErrors } = await runSyncAllLogic();

    console.log("\n" + `${colors.bright} RESUMO DA EXECUÇÃO:${colors.reset}`);

    results.forEach((r) => {
      const icon = r.success
        ? `${colors.green}✓${colors.reset}`
        : `${colors.red}✗${colors.reset}`;
      const time = (r.duration / 1000).toFixed(2);
      console.log(`  ${icon} ${r.scriptName.padEnd(30)} (${time}s)`);
    });

    console.log(
      "\n" +
        `⏱️  Tempo Total: ${colors.cyan}${(totalDuration / 1000).toFixed(2)}s${colors.reset}`,
    );

    if (hasErrors) {
      console.log(
        `${colors.red}  Sincronização concluída com falhas em alguns scripts.${colors.reset}\n`,
      );
      process.exit(1);
    }

    console.log(
      `${colors.green} Sincronização concluída com sucesso!${colors.reset}\n`,
    );
    process.exit(0);
  } catch (error) {
    console.error(`\n${colors.red} ERRO FATAL:${colors.reset}`, error);
    process.exit(1);
  }
}

main();
