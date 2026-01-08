import { prisma } from '../lib/prisma';

/**
 * Interface para a resposta da API de pacientes
 */
interface PatientAPIResponse {
  rows: {
    hid_cod_paciente: string;
    razao_social: string;
    nome_completo: string;
    nome_mae: string;
    identidade: string;
    cpf: string;
    telefone_residencial: string;
    fone_celular: string;
  }[];
  total?: number;
  page?: number;
}

/**
 * Configuração da API
 */
const API_CONFIG = {
  url: 'https://ww3.s2web.com.br/lp_riodoce/modules/pacientes/pacientes_visualizacao.php',
  headers: {
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Accept-Language': 'en-US,en;q=0.9',
    'Connection': 'keep-alive',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Origin': 'https://ww3.s2web.com.br',
    'Referer': 'https://ww3.s2web.com.br/lp_riodoce/index.php?m=pacientes&a=index',
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
 * Busca pacientes de uma página específica da API
 */
async function fetchPatientsPage(page: number): Promise<PatientAPIResponse | null> {
  const body = new URLSearchParams({
    cod_usuario: '164',
    token: 'def8da680cc93b34f28564cffcf1132e',
    letra: '',
    convenios: '',
    nome_paciente: '',
    nome_mae: '',
    cpf: '',
    celular: '',
    telefone: '',
    data_nascimento: '',
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
 * Script principal de importação de pacientes
 */
async function importPatients() {
  console.log('🚀 Iniciando importação de pacientes...\n');

  let page = 1;
  let hasMore = true;
  let totalImported = 0;
  let totalUpdated = 0;
  let totalErrors = 0;

  try {
    while (hasMore) {
      console.log(`📄 Buscando página ${page}...`);

      const data = await fetchPatientsPage(page);

      // Se não houver dados ou a lista estiver vazia, parar
      if (!data || !data.rows || data.rows.length === 0) {
        console.log('✅ Não há mais páginas para processar.\n');
        hasMore = false;
        break;
      }

      console.log(`   ➡️  Encontrados ${data.rows.length} pacientes nesta página`);

      // Processar todos os pacientes em paralelo usando Promise.all
      const results = await Promise.allSettled(
        data.rows.map(async (patient) => {
          const result = await prisma.patient.upsert({
            where: {
              externalId_sourceSystem: {
                externalId: patient.hid_cod_paciente,
                sourceSystem: API_CONFIG.sourceSystem,
              },
            },
            update: {
              fullName: patient.nome_completo,
              motherName: patient.nome_mae || null,
              identityNumber: patient.identidade || null,
              cpf: patient.cpf || null,
              homePhone: patient.telefone_residencial || null,
              mobilePhone: patient.fone_celular || null,
              insuranceName: patient.razao_social || null,
              syncedAt: new Date(),
              rawPayload: patient,
            },
            create: {
              externalId: patient.hid_cod_paciente,
              fullName: patient.nome_completo,
              motherName: patient.nome_mae || null,
              identityNumber: patient.identidade || null,
              cpf: patient.cpf || null,
              homePhone: patient.telefone_residencial || null,
              mobilePhone: patient.fone_celular || null,
              insuranceName: patient.razao_social || null,
              sourceSystem: API_CONFIG.sourceSystem,
              syncedAt: new Date(),
              rawPayload: patient,
            },
          });

          return { result, patient };
        })
      );

      // Processar os resultados
      results.forEach((promiseResult) => {
        if (promiseResult.status === 'fulfilled') {
          const { result, patient } = promiseResult.value;
          
          // Verificar se foi criado ou atualizado
          const isNew = result.createdAt.getTime() === result.updatedAt.getTime();
          if (isNew) {
            totalImported++;
          } else {
            totalUpdated++;
          }

          const cpfInfo = patient.cpf ? ` CPF: ${patient.cpf}` : '';
          console.log(`   ✓ ${patient.nome_completo} (ID: ${patient.hid_cod_paciente}${cpfInfo})`);
        } else {
          totalErrors++;
          console.error(`   ✗ Erro ao processar paciente:`, promiseResult.reason);
        }
      });

      console.log(''); // Linha em branco para separar páginas
      page++;

      // Pequeno delay entre requisições para não sobrecarregar a API
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Resumo final
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ IMPORTAÇÃO CONCLUÍDA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Estatísticas:`);
    console.log(`   • Total de páginas processadas: ${page - 1}`);
    console.log(`   • Pacientes criados: ${totalImported}`);
    console.log(`   • Pacientes atualizados: ${totalUpdated}`);
    console.log(`   • Total processado: ${totalImported + totalUpdated}`);
    if (totalErrors > 0) {
      console.log(`   • Erros: ${totalErrors}`);
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
importPatients()
  .then(() => {
    console.log('🎉 Script finalizado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script finalizado com erro:', error);
    process.exit(1);
  });
