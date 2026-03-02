import { CadenceType, DispatchStatus, MessageStatus } from '@prisma/client';
import { dispatchDAO } from '@/DAO/dispatch';
import { patientDAO } from '@/DAO/patient';
import { whatsappService } from './whatsapp.service';
import { processQueueWithDelay, retryWithBackoff } from '@/utils/queue';

/**
 * DispatchService - Lógica de negócio para disparos de mensagens
 */

interface ExecuteDispatchParams {
  cadence: CadenceType;
  days: number;
  maxPatients?: number;
}

export class DispatchService {
  /**
   * Executa um disparo completo
   */
  async executeDispatch(params: ExecuteDispatchParams) {
    const { cadence, days, maxPatients = 30 } = params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log(`\n🚀 Starting dispatch for ${cadence} (${days} days)...`);

    // 1. Valida dia da semana (não processa sábado/domingo)
    const dayOfWeek = today.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      throw new Error('Disparos não são permitidos aos finais de semana');
    }

    // 2. Verifica se já existe disparo pendente/em progresso para hoje
    const existingDispatch = await dispatchDAO.findExistingDispatch(cadence, today);
    if (existingDispatch) {
      throw new Error(
        `Já existe um disparo ${existingDispatch.status} para ${cadence} hoje`
      );
    }

    // 3. Busca pacientes inativos
    console.log(`📋 Fetching inactive patients (${days} days without appointment)...`);
    const monthsInactive = Math.floor(days / 30);
    const inactivePatients = await patientDAO.getPatientsAtRisk(monthsInactive);

    // Filtra pacientes com telefone válido
    const patientsWithPhone = inactivePatients.filter(
      (patient) => patient.mobilePhone || patient.homePhone
    );

    if (patientsWithPhone.length === 0) {
      throw new Error('Nenhum paciente inativo encontrado com telefone válido');
    }

    // Limita ao máximo de pacientes
    const selectedPatients = patientsWithPhone.slice(0, maxPatients);
    
    console.log(`✅ Found ${patientsWithPhone.length} patients with phone`);
    console.log(`📤 Will dispatch to ${selectedPatients.length} patients (limit: ${maxPatients})`);

    // 4. Cria registro do disparo
    const dispatch = await dispatchDAO.createDispatch({
      cadence,
      date: today,
      status: DispatchStatus.PENDING,
      totalPatients: selectedPatients.length,
    });

    console.log(`✨ Dispatch created: ${dispatch.id}`);

    // 5. Cria items do disparo
    const templateName = this.getTemplateName(cadence);
    const items = selectedPatients.map((patient) => ({
      dispatchId: dispatch.id,
      patientId: patient.id,
      phoneNumber: patient.mobilePhone || patient.homePhone || '',
      messageTemplate: templateName,
      status: MessageStatus.PENDING,
    }));

    await dispatchDAO.createManyItems(items);
    console.log(`📝 Created ${items.length} dispatch items`);

    // 6. Inicia processamento assíncrono (não bloqueia resposta)
    this.processDispatchQueue(dispatch.id).catch((error) => {
      console.error('Error processing dispatch queue:', error);
    });

    return {
      dispatchId: dispatch.id,
      cadence,
      totalPatients: selectedPatients.length,
      status: DispatchStatus.PENDING,
      message: 'Disparo iniciado com sucesso. O processamento continuará em background.',
    };
  }

  /**
   * Processa a fila de mensagens de um disparo
   */
  private async processDispatchQueue(dispatchId: string) {
    console.log(`\n🔄 Starting queue processing for dispatch ${dispatchId}...`);

    try {
      // Atualiza status para IN_PROGRESS
      await dispatchDAO.updateDispatch(dispatchId, {
        status: DispatchStatus.IN_PROGRESS,
        startedAt: new Date(),
      });

      // Busca items pendentes
      const pendingItems = await dispatchDAO.findPendingItems(dispatchId);
      console.log(`📦 Processing ${pendingItems.length} pending items...`);

      // Processa cada item com delay de 2 minutos (120.000ms)
      const DELAY_MS = 2 * 60 * 1000; // 2 minutos

      await processQueueWithDelay(
        pendingItems,
        async (item, index) => {
          console.log(item)
          return await this.processDispatchItem(
            item.id,
            // item.phoneNumber,
            "5581991693706",
            item.messageTemplate,
            (item as any).patient.fullName // Passa o nome do paciente
          );
        },
        DELAY_MS
      );

      // Atualiza contadores finais
      await dispatchDAO.updateCounters(dispatchId);

      // Marca como completo
      await dispatchDAO.updateDispatch(dispatchId, {
        status: DispatchStatus.COMPLETED,
        completedAt: new Date(),
      });

      console.log(`✅ Dispatch ${dispatchId} completed successfully!`);
    } catch (error) {
      console.error(`❌ Error processing dispatch ${dispatchId}:`, error);

      // Marca como falho
      await dispatchDAO.updateDispatch(dispatchId, {
        status: DispatchStatus.FAILED,
        completedAt: new Date(),
      });
    }
  }

  /**
   * Processa um item individual (envia mensagem)
   */
  private async processDispatchItem(
    itemId: string,
    phoneNumber: string,
    templateName: string,
    clientName: string
  ): Promise<void> {
    console.log(`📱 Sending message to ${phoneNumber} (${clientName})...`);

    try {
      // Tenta enviar com retry
      const result = await retryWithBackoff(
        async () => {
          return await whatsappService.sendTemplateMessage({
            to: phoneNumber,
            templateName,
            components: [
              {
                type: 'body',
                parameters: [
                  {
                    type: 'text',
                    parameter_name: "client_name",
                    text: clientName,
                  },
                ],
              },
            ],
          });
        },
        3, // 3 tentativas
        1000 // delay inicial de 1 segundo
      );

      if (result.success) {
        // Atualiza item como enviado
        await dispatchDAO.updateItem(itemId, {
          status: MessageStatus.SENT,
          whatsappMessageId: result.messageId,
          sentAt: new Date(),
        });

        console.log(`✅ Message sent successfully to ${phoneNumber}`);
      } else {
        // Atualiza item como falho
        await dispatchDAO.updateItem(itemId, {
          status: MessageStatus.FAILED,
          errorMessage: result.error,
        });

        console.error(`❌ Failed to send message to ${phoneNumber}: ${result.error}`);
      }
    } catch (error: any) {
      // Atualiza item como falho
      await dispatchDAO.updateItem(itemId, {
        status: MessageStatus.FAILED,
        errorMessage: error.message || 'Erro desconhecido',
      });

      console.error(`❌ Error sending message to ${phoneNumber}:`, error);
    }
  }

  /**
   * Busca relatórios de disparos
   */
  async getReports(filters: {
    startDate?: Date;
    endDate?: Date;
    cadence?: CadenceType;
  }) {
    return await dispatchDAO.getReports(filters);
  }

  /**
   * Busca detalhes de um disparo específico
   */
  async getDispatchById(id: string) {
    const dispatch = await dispatchDAO.findDispatchById(id, {
      items: {
        include: {
          patient: {
            select: {
              id: true,
              fullName: true,
              mobilePhone: true,
              homePhone: true,
            },
          },
        },
      },
    });

    if (!dispatch) {
      throw new Error('Disparo não encontrado');
    }

    // Cast para o tipo correto incluindo items
    const dispatchWithItems = dispatch as typeof dispatch & {
      items: Array<{
        status: MessageStatus;
        patient: {
          id: string;
          fullName: string;
          mobilePhone: string | null;
          homePhone: string | null;
        };
      }>;
    };

    // Verifica se items existe (TypeScript guard)
    if (!dispatchWithItems.items || !Array.isArray(dispatchWithItems.items)) {
      throw new Error('Items do disparo não encontrados');
    }

    // Recalcula contadores baseado nos status atuais dos items
    const successCount = dispatchWithItems.items.filter(
      item => item.status === MessageStatus.SENT || 
              item.status === MessageStatus.DELIVERED || 
              item.status === MessageStatus.READ
    ).length;

    const errorCount = dispatchWithItems.items.filter(
      item => item.status === MessageStatus.FAILED
    ).length;

    // Calcula taxa de sucesso baseado nos contadores atualizados
    const successRate = dispatch.totalPatients > 0
      ? (successCount / dispatch.totalPatients) * 100
      : 0;

    return {
      ...dispatchWithItems,
      successCount,
      errorCount,
      successRate: Number(successRate.toFixed(2)),
    };
  }

  /**
   * Retorna nome do template baseado na cadência
   */
  private getTemplateName(cadence: CadenceType): string {
    const templates = {
      [CadenceType.THIRTY_DAYS]: 'clinic_reactivation_30d',
      [CadenceType.SIXTY_DAYS]: 'clinic_reactivation_60d',
      [CadenceType.NINETY_DAYS]: 'clinic_reactivation_90d',
    };

    return templates[cadence];
  }
}

export const dispatchService = new DispatchService();
