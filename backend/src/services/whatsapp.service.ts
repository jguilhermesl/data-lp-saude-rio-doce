import axios from 'axios';

/**
 * WhatsAppService - Integração com WhatsApp Business Cloud API (Meta)
 * Documentação: https://developers.facebook.com/docs/whatsapp/cloud-api/
 */

interface SendTemplateMessageParams {
  to: string;
  templateName: string;
  languageCode?: string;
  components?: any[];
}

interface WhatsAppResponse {
  messaging_product: string;
  contacts: Array<{
    input: string;
    wa_id: string;
  }>;
  messages: Array<{
    id: string;
  }>;
}

export class WhatsAppService {
  private readonly apiUrl: string;
  private readonly accessToken: string;
  private readonly phoneNumberId: string;

  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
    this.apiUrl = `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`;

    if (!this.accessToken || !this.phoneNumberId) {
      console.warn(
        '⚠️ WhatsApp credentials not configured. Set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID in .env'
      );
    }
  }

  /**
   * Valida se as credenciais estão configuradas
   */
  private validateCredentials(): void {
    if (!this.accessToken || !this.phoneNumberId) {
      throw new Error(
        'WhatsApp credentials not configured. Set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID in .env'
      );
    }
  }

  /**
   * Formata número de telefone para o formato internacional
   * Remove caracteres especiais e adiciona código do país se necessário
   */
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove todos os caracteres não numéricos
    let cleaned = phoneNumber.replace(/\D/g, '');

    // Se começar com 0, remove
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }

    // Se não tiver código do país (55 para Brasil), adiciona
    if (!cleaned.startsWith('55') && cleaned.length <= 11) {
      cleaned = '55' + cleaned;
    }

    return cleaned;
  }

  /**
   * Valida formato do número de telefone
   */
  private validatePhoneNumber(phoneNumber: string): boolean {
    const formatted = this.formatPhoneNumber(phoneNumber);
    // Número brasileiro deve ter 13 dígitos: 55 + DDD (2) + número (9)
    return formatted.length >= 12 && formatted.length <= 13;
  }

  /**
   * Envia mensagem usando template aprovado
   */
  async sendTemplateMessage(params: SendTemplateMessageParams): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    try {
      this.validateCredentials();

      // Valida número
      if (!this.validatePhoneNumber(params.to)) {
        return {
          success: false,
          error: `Número de telefone inválido: ${params.to}`,
        };
      }

      const formattedPhone = this.formatPhoneNumber(params.to);

      // Monta payload da requisição
      const payload = {
        messaging_product: 'whatsapp',
        to: formattedPhone,
        type: 'template',
        template: {
          name: params.templateName,
          language: {
            code: params.languageCode || 'pt_BR',
          },
          ...(params.components && { components: params.components }),
        },
      };

      // Envia requisição para API do WhatsApp
      const response = await axios.post<WhatsAppResponse>(
        this.apiUrl,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 segundos
        }
      );

      // Retorna sucesso com ID da mensagem
      return {
        success: true,
        messageId: response.data.messages[0].id,
      };
    } catch (error: any) {
      console.error('Error sending WhatsApp message:', error.response?.data || error.message);

      // Trata erros específicos da API do WhatsApp
      let errorMessage = 'Erro ao enviar mensagem';

      if (error.response?.data?.error) {
        const apiError = error.response.data.error;
        errorMessage = `${apiError.message} (Code: ${apiError.code})`;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Busca status de uma mensagem específica
   */
  async getMessageStatus(messageId: string): Promise<{
    success: boolean;
    status?: string;
    error?: string;
  }> {
    try {
      this.validateCredentials();

      const url = `https://graph.facebook.com/v18.0/${messageId}`;
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
        timeout: 15000,
      });

      return {
        success: true,
        status: response.data.status,
      };
    } catch (error: any) {
      console.error('Error getting message status:', error.response?.data || error.message);

      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }

  /**
   * Testa conectividade com a API
   */
  async testConnection(): Promise<boolean> {
    try {
      this.validateCredentials();

      // Tenta buscar informações do phone number
      const url = `https://graph.facebook.com/v18.0/${this.phoneNumberId}`;
      await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
        timeout: 10000,
      });

      return true;
    } catch (error) {
      console.error('WhatsApp connection test failed:', error);
      return false;
    }
  }

  /**
   * Retorna os templates de mensagem baseado na cadência
   */
  getTemplateNameForCadence(cadence: '30' | '60' | '90'): string {
    const templates = {
      '30': 'clinic_reactivation_30d',
      '60': 'clinic_reactivation_60d',
      '90': 'clinic_reactivation_90d',
    };

    return templates[cadence];
  }
}

export const whatsappService = new WhatsAppService();
