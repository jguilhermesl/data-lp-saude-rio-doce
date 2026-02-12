import { prisma } from '../lib/prisma';

/**
 * Interface para a resposta da API de médicos
 */
interface DoctorAPIResponse {
  rows: {
    hid_cod_medico: string;
    nome_completo: string;
    crm: string;
    telefone_residencial: string;
    telefone_comercial: string;
    celular: string;
    especialidades: string | null;
  }[];
  total?: number;
  page?: number;
}

/**
 * Configuração da API
 */
const API_CONFIG = {
  url: 'https://ww3.s2web.com.br/lp_riodoce/modules/medicos/medicos_visualizacao.php',
  headers: {
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Accept-Language': 'en-US,en;q=0.9',
    'Connection': 'keep-alive',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Origin': 'https://ww3.s2web.com.br',
    'Referer': 'https://ww3.s2web.com.br/lp_riodoce/index.php?m=medicos',
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
  rowsPerPage: 300, // Otimizado: 50 → 300 para reduzir número de requisições
};

/**
 * Busca médicos de uma página específica da API
 */
async function fetchDoctorsPage(page: number): Promise<DoctorAPIResponse | null> {
  const body = new URLSearchParams({
    cod_usuario: '164',
    token: '80d61f7e77bc15d9216b53dbe2769eea',
    letra: '',
    especialidade: '',
    sis_posto: '',
    tipo_medico: 'T',
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
 * Script principal de importação de médicos
 */
async function importDoctors() {
  console.log('🚀 Iniciando importação de médicos...\n');

  let page = 1;
  let hasMore = true;
  let totalImported = 0;
  let totalUpdated = 0;
  let totalErrors = 0;

  try {
    while (hasMore) {
      console.log(`📄 Buscando página ${page}...`);

      const data = await fetchDoctorsPage(page);

      // Se não houver dados ou a lista estiver vazia, parar
      if (!data || !data.rows || data.rows.length === 0) {
        console.log('✅ Não há mais páginas para processar.\n');
        hasMore = false;
        break;
      }

      console.log(`   ➡️  Encontrados ${data.rows.length} médicos nesta página`);

      // Processar todos os médicos em paralelo usando Promise.all
      const results = await Promise.allSettled(
        data.rows.map(async (doctor) => {
          const result = await prisma.doctor.upsert({
            where: {
              externalId_sourceSystem: {
                externalId: doctor.hid_cod_medico,
                sourceSystem: API_CONFIG.sourceSystem,
              },
            },
            update: {
              name: doctor.nome_completo,
              crm: doctor.crm || null,
              homePhone: doctor.telefone_residencial || null,
              workPhone: doctor.telefone_comercial || null,
              mobilePhone: doctor.celular || null,
              syncedAt: new Date(),
              rawPayload: doctor,
            },
            create: {
              externalId: doctor.hid_cod_medico,
              name: doctor.nome_completo,
              crm: doctor.crm || null,
              homePhone: doctor.telefone_residencial || null,
              workPhone: doctor.telefone_comercial || null,
              mobilePhone: doctor.celular || null,
              sourceSystem: API_CONFIG.sourceSystem,
              syncedAt: new Date(),
              rawPayload: doctor,
            },
          });

          return { result, doctor };
        })
      );

      // Processar os resultados
      results.forEach((promiseResult) => {
        if (promiseResult.status === 'fulfilled') {
          const { result, doctor } = promiseResult.value;
          
          // Verificar se foi criado ou atualizado
          const isNew = result.createdAt.getTime() === result.updatedAt.getTime();
          if (isNew) {
            totalImported++;
          } else {
            totalUpdated++;
          }

          console.log(`   ✓ ${doctor.nome_completo} (ID: ${doctor.hid_cod_medico}, CRM: ${doctor.crm || 'N/A'})`);
        } else {
          totalErrors++;
          console.error(`   ✗ Erro ao processar médico:`, promiseResult.reason);
        }
      });

      console.log(''); // Linha em branco para separar páginas
      page++;

      // Delay otimizado entre requisições (500ms → 100ms)
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Resumo final
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ IMPORTAÇÃO CONCLUÍDA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Estatísticas:`);
    console.log(`   • Total de páginas processadas: ${page - 1}`);
    console.log(`   • Médicos criados: ${totalImported}`);
    console.log(`   • Médicos atualizados: ${totalUpdated}`);
    console.log(`   • Total processado: ${totalImported + totalUpdated}`);
    if (totalErrors > 0) {
      console.log(`   • Erros: ${totalErrors}`);
    }
    console.log('\n💡 Dica: Execute o script de importação de especialidades dos médicos:');
    console.log('   npm run import:doctor-specialties (criar futuramente)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.error('❌ Erro fatal durante a importação:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o script
importDoctors()
  .then(() => {
    console.log('🎉 Script finalizado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script finalizado com erro:', error);
    process.exit(1);
  });
