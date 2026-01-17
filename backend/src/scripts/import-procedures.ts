import { prisma } from '../lib/prisma';

/**
 * Interface para a resposta da API de procedimentos (endpoint medicos_especialidade)
 */
interface ProcedureAPIResponse {
  rows: {
    hid_cod_amb: string;
    especialidade: string;
    sigla: string;
    descricao: string;
    ch: string;
    fnd_valor: string;
  }[];
  total?: number;
  page?: number;
}

/**
 * Interface para a resposta da API AMB (endpoint amb_visualizacao)
 */
interface AMBAPIResponse {
  rows: {
    cod_amb: string;
    hid_cod_amb: string;
    sigla: string;
    tipo_tabela: string;
    tabela_amb: string;
    descricao: string;
    fnd_valor: string;
    id_categoria: string;
    id_especialidade: string;
    prazo_volta: string;
    categoria: string | null;
    especialidade: string;
  }[];
  total?: number;
  page?: number;
}

/**
 * Configuração da API de Procedimentos (medicos_especialidade)
 */
const API_CONFIG = {
  url: 'https://ww3.s2web.com.br/lp_riodoce/modules/medicos_especialidade/procedimentos_visualizacao.php',
  headers: {
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Accept-Language': 'en-US,en;q=0.9',
    'Connection': 'keep-alive',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Origin': 'https://ww3.s2web.com.br',
    'Referer': 'https://ww3.s2web.com.br/lp_riodoce/index.php?m=medicos_especialidade',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
    'X-Requested-With': 'XMLHttpRequest',
    'sec-ch-ua': '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'Cookie': 'dotproject=hllhp910t3ar325ms9m3tq7el6; PHPSESSID=kd2rmta1sup8elfvpcsr04nrq4',
  },
  sourceSystem: 's2web',
  rowsPerPage: 50,
};

/**
 * Configuração da API AMB (amb_visualizacao)
 */
const AMB_API_CONFIG = {
  url: 'https://ww3.s2web.com.br/lp_riodoce/modules/amb/amb_visualizacao.php',
  headers: {
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Accept-Language': 'en-US,en;q=0.9',
    'Connection': 'keep-alive',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Origin': 'https://ww3.s2web.com.br',
    'Referer': 'https://ww3.s2web.com.br/lp_riodoce/index.php?m=amb',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
    'X-Requested-With': 'XMLHttpRequest',
    'sec-ch-ua': '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'Cookie': 'dotproject=hllhp910t3ar325ms9m3tq7el6; PHPSESSID=kd2rmta1sup8elfvpcsr04nrq4',
  },
  sourceSystem: 's2web',
  rowsPerPage: 100,
};

/**
 * Converte valor BR (135,00) ou centavos (11500) para decimal
 * Se o valor não contém vírgula ou ponto, assume que está em centavos
 * Exemplos: "11500" -> 115.00 | "135,00" -> 135.00 | "1.135,50" -> 1135.50
 */
function parseDecimalValue(value: string): number | null {
  if (!value || value === '0' || value === '0,00' || value === '0.00') {
    return null;
  }
  
  // Se não contém vírgula nem ponto, está em centavos (formato inteiro)
  if (!value.includes(',') && !value.includes('.')) {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? null : parsed / 100; // Dividir por 100 para converter de centavos
  }
  
  // Caso contrário, processar como formato BR (1.234,56 ou 234,56)
  const normalized = value.replace(/\./g, '').replace(',', '.');
  const parsed = parseFloat(normalized);
  
  return isNaN(parsed) ? null : parsed;
}

/**
 * Busca procedimentos de uma página específica da API (medicos_especialidade)
 */
async function fetchProceduresPage(page: number): Promise<ProcedureAPIResponse | null> {
  const body = new URLSearchParams({
    cod_usuario: '164',
    token: '449abd89ca62f8a9a71d6ef5741a0434',
    letra: '',
    page: page.toString(),
    rows: API_CONFIG.rowsPerPage.toString(),
  });

  try {
    const response = await fetch(API_CONFIG.url, {
      method: 'POST',
      headers: API_CONFIG.headers,
      body: body.toString(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Verificar se há conteúdo antes de parsear
    const text = await response.text();
    if (!text || text.trim() === '') {
      return null;
    }

    return JSON.parse(text);
  } catch (error) {
    if (error instanceof SyntaxError) {
      // Erro de parsing JSON - provavelmente fim da paginação
      return null;
    }
    throw error;
  }
}

/**
 * Busca procedimentos AMB de uma página específica da API
 */
async function fetchAMBProceduresPage(page: number): Promise<AMBAPIResponse | null> {
  const body = new URLSearchParams({
    cod_usuario: '164',
    token: 'c71613c0ffca35cbf4789f6435b25e53',
    letra: '',
    filtro_id_especialidade: '',
    filtro_id_categoria: '',
    page: page.toString(),
    rows: AMB_API_CONFIG.rowsPerPage.toString(),
  });

  try {
    const response = await fetch(AMB_API_CONFIG.url, {
      method: 'POST',
      headers: AMB_API_CONFIG.headers,
      body: body.toString(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Verificar se há conteúdo antes de parsear
    const text = await response.text();
    if (!text || text.trim() === '') {
      return null;
    }

    return JSON.parse(text);
  } catch (error) {
    if (error instanceof SyntaxError) {
      // Erro de parsing JSON - provavelmente fim da paginação
      return null;
    }
    throw error;
  }
}

/**
 * Cache de especialidades (nome -> id)
 */
let specialtiesCache: Map<string, string> | null = null;

/**
 * Carrega todas as especialidades em cache
 */
async function loadSpecialtiesCache(): Promise<Map<string, string>> {
  if (specialtiesCache) {
    return specialtiesCache;
  }

  console.log('📥 Carregando especialidades em cache...');
  
  const specialties = await prisma.specialty.findMany({
    where: {
      sourceSystem: API_CONFIG.sourceSystem,
    },
    select: {
      id: true,
      name: true,
    },
  });

  specialtiesCache = new Map(
    specialties.map((s) => [s.name.toUpperCase(), s.id])
  );

  console.log(`   ✓ ${specialtiesCache.size} especialidades carregadas\n`);
  
  return specialtiesCache;
}

/**
 * Busca especialidade por nome usando cache
 */
function findSpecialtyByName(name: string | null, cache: Map<string, string>): string | null {
  if (!name) {
    return null;
  }
  return cache.get(name.toUpperCase()) || null;
}

/**
 * Importa procedimentos do endpoint medicos_especialidade
 */
async function importMedicosEspecialidadeProcedures(
  specialtiesCache: Map<string, string>,
  stats: { imported: number; updated: number; errors: number; specialtiesNotFound: Set<string> }
) {
  console.log('📋 Importando procedimentos do endpoint MEDICOS_ESPECIALIDADE...\n');

  let page = 1;
  let hasMore = true;

  while (hasMore) {
    console.log(`📄 Buscando página ${page} (medicos_especialidade)...`);

    const data = await fetchProceduresPage(page);

    if (!data || !data.rows || data.rows.length === 0) {
      console.log('✅ Não há mais páginas para processar (medicos_especialidade).\n');
      hasMore = false;
      break;
    }

    console.log(`   ➡️  Encontrados ${data.rows.length} procedimentos nesta página`);

    const results = await Promise.allSettled(
      data.rows.map(async (procedure) => {
        const specialtyId = findSpecialtyByName(procedure.especialidade, specialtiesCache);
        
        if (!specialtyId) {
          stats.specialtiesNotFound.add(procedure.especialidade);
        }

        const defaultPrice = parseDecimalValue(procedure.fnd_valor);

        const result = await prisma.procedure.upsert({
          where: {
            externalId_sourceSystem: {
              externalId: procedure.hid_cod_amb,
              sourceSystem: API_CONFIG.sourceSystem,
            },
          },
          update: {
            name: procedure.descricao,
            code: procedure.sigla || null,
            defaultPrice: defaultPrice,
            ch: procedure.ch || null,
            specialtyName: procedure.especialidade,
            specialtyId: specialtyId,
            syncedAt: new Date(),
            rawPayload: procedure,
          },
          create: {
            externalId: procedure.hid_cod_amb,
            name: procedure.descricao,
            code: procedure.sigla || null,
            defaultPrice: defaultPrice,
            ch: procedure.ch || null,
            specialtyName: procedure.especialidade,
            specialtyId: specialtyId,
            sourceSystem: API_CONFIG.sourceSystem,
            syncedAt: new Date(),
            rawPayload: procedure,
          },
        });

        return { result, procedure, specialtyId };
      })
    );

    results.forEach((promiseResult) => {
      if (promiseResult.status === 'fulfilled') {
        const { result, procedure, specialtyId } = promiseResult.value;
        
        const isNew = result.createdAt.getTime() === result.updatedAt.getTime();
        if (isNew) {
          stats.imported++;
        } else {
          stats.updated++;
        }

        const specialtyWarning = !specialtyId ? ' ⚠️' : '';
        console.log(`   ✓ ${procedure.descricao} (ID: ${procedure.hid_cod_amb})${specialtyWarning}`);
      } else {
        stats.errors++;
        console.error(`   ✗ Erro ao processar procedimento:`, promiseResult.reason);
      }
    });

    console.log('');
    page++;

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return page - 1;
}

/**
 * Importa procedimentos do endpoint AMB
 */
async function importAMBProcedures(
  specialtiesCache: Map<string, string>,
  stats: { imported: number; updated: number; errors: number; specialtiesNotFound: Set<string> }
) {
  console.log('📋 Importando procedimentos do endpoint AMB...\n');

  let page = 1;
  let hasMore = true;

  while (hasMore) {
    console.log(`📄 Buscando página ${page} (AMB)...`);

    const data = await fetchAMBProceduresPage(page);

    if (!data || !data.rows || data.rows.length === 0) {
      console.log('✅ Não há mais páginas para processar (AMB).\n');
      hasMore = false;
      break;
    }

    console.log(`   ➡️  Encontrados ${data.rows.length} procedimentos nesta página`);

    const results = await Promise.allSettled(
      data.rows.map(async (procedure) => {
        const specialtyId = findSpecialtyByName(procedure.especialidade, specialtiesCache);
        
        if (!specialtyId) {
          stats.specialtiesNotFound.add(procedure.especialidade);
        }

        const defaultPrice = parseDecimalValue(procedure.fnd_valor);

        const result = await prisma.procedure.upsert({
          where: {
            externalId_sourceSystem: {
              externalId: procedure.hid_cod_amb,
              sourceSystem: AMB_API_CONFIG.sourceSystem,
            },
          },
          update: {
            name: procedure.descricao.trim(),
            code: procedure.sigla || null,
            defaultPrice: defaultPrice,
            ch: null, // AMB não tem campo CH
            specialtyName: procedure.especialidade,
            specialtyId: specialtyId,
            syncedAt: new Date(),
            rawPayload: procedure,
          },
          create: {
            externalId: procedure.hid_cod_amb,
            name: procedure.descricao.trim(),
            code: procedure.sigla || null,
            defaultPrice: defaultPrice,
            ch: null, // AMB não tem campo CH
            specialtyName: procedure.especialidade,
            specialtyId: specialtyId,
            sourceSystem: AMB_API_CONFIG.sourceSystem,
            syncedAt: new Date(),
            rawPayload: procedure,
          },
        });

        return { result, procedure, specialtyId };
      })
    );

    results.forEach((promiseResult) => {
      if (promiseResult.status === 'fulfilled') {
        const { result, procedure, specialtyId } = promiseResult.value;
        
        const isNew = result.createdAt.getTime() === result.updatedAt.getTime();
        if (isNew) {
          stats.imported++;
        } else {
          stats.updated++;
        }

        const specialtyWarning = !specialtyId ? ' ⚠️' : '';
        console.log(`   ✓ ${procedure.descricao.trim()} (ID: ${procedure.hid_cod_amb})${specialtyWarning}`);
      } else {
        stats.errors++;
        console.error(`   ✗ Erro ao processar procedimento:`, promiseResult.reason);
      }
    });

    console.log('');
    page++;

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return page - 1;
}

/**
 * Script principal de importação de procedimentos
 */
async function importProcedures() {
  console.log('🚀 Iniciando importação de procedimentos/exames...\n');

  const stats = {
    imported: 0,
    updated: 0,
    errors: 0,
    specialtiesNotFound: new Set<string>(),
  };

  try {
    // Carregar cache de especialidades antes de começar
    const specialtiesCache = await loadSpecialtiesCache();

    // Importar de ambos os endpoints
    const pagesMedicosEspecialidade = await importMedicosEspecialidadeProcedures(specialtiesCache, stats);
    const pagesAMB = await importAMBProcedures(specialtiesCache, stats);
    // Resumo final
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ IMPORTAÇÃO CONCLUÍDA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Estatísticas:`);
    console.log(`   • Páginas processadas (medicos_especialidade): ${pagesMedicosEspecialidade}`);
    console.log(`   • Páginas processadas (AMB): ${pagesAMB}`);
    console.log(`   • Total de páginas: ${pagesMedicosEspecialidade + pagesAMB}`);
    console.log(`   • Procedimentos criados: ${stats.imported}`);
    console.log(`   • Procedimentos atualizados: ${stats.updated}`);
    console.log(`   • Total processado: ${stats.imported + stats.updated}`);
    if (stats.errors > 0) {
      console.log(`   • Erros: ${stats.errors}`);
    }
    
    if (stats.specialtiesNotFound.size > 0) {
      console.log(`\n⚠️  Especialidades não encontradas no banco (${stats.specialtiesNotFound.size}):`);
      stats.specialtiesNotFound.forEach(name => {
        console.log(`   • ${name}`);
      });
      console.log('\n💡 Dica: Execute primeiro o script de importação de especialidades:');
      console.log('   npm run import:specialties');
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.error('❌ Erro fatal durante a importação:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o script
importProcedures()
  .then(() => {
    console.log('🎉 Script finalizado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script finalizado com erro:', error);
    process.exit(1);
  });
