'use client';

import { useState } from 'react';
import { useBirthdays } from '@/hooks/useBirthdays';
import { Cake, Phone, User, Calendar, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const BirthdaysCard = () => {
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const router = useRouter();

  const { data, isLoading, error } = useBirthdays(selectedDate);

  const handleWhatsAppClick = (phone: string) => {
    // Limpar telefone e abrir WhatsApp
    const cleanPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent('Olá! Feliz aniversário! 🎉🎂');
    window.open(
      `https://wa.me/55${cleanPhone}?text=${message}`,
      '_blank'
    );
  };

  const handlePatientClick = (patientId: string) => {
    router.push(`/patient/${patientId}`);
  };

  const formatDateDisplay = (dateString: string) => {
    // Adicionar horário para evitar problemas de timezone
    return format(new Date(dateString + 'T12:00:00'), "d 'de' MMMM", { locale: ptBR });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header - Clickable to expand/collapse */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 bg-gradient-to-r from-pink-50 to-purple-50 hover:from-pink-100 hover:to-purple-100 transition-colors text-left"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-pink-100 rounded-lg">
              <Cake className="w-6 h-6 text-pink-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Aniversariantes
              </h3>
              <p className="text-sm text-gray-500">
                {!isLoading && data ? (
                  `${data.data.total} paciente${data.data.total !== 1 ? 's' : ''} fazendo aniversário`
                ) : (
                  'Pacientes fazendo aniversário'
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            )}
          </div>
        </div>
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <>
          {/* Date Selector */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <label
              htmlFor="birthday-date"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Selecionar data:
            </label>
            <input
              id="birthday-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          {/* Content */}
          <div className="p-6">
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-pink-600 animate-spin" />
              </div>
            )}

            {error && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                  <Calendar className="w-8 h-8 text-red-600" />
                </div>
                <p className="text-gray-600 mb-2">Erro ao carregar aniversariantes</p>
                <p className="text-gray-400 text-sm">
                  {error instanceof Error ? error.message : 'Erro desconhecido'}
                </p>
              </div>
            )}

            {!isLoading && !error && data && (
              <>
                {/* Summary */}
                <div className="mb-4 p-4 bg-pink-50 rounded-lg border border-pink-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        Aniversariantes em{' '}
                        <span className="font-semibold">
                          {formatDateDisplay(selectedDate)}
                        </span>
                      </p>
                      <p className="text-2xl font-bold text-pink-600 mt-1">
                        {data.data.total}
                      </p>
                    </div>
                    <Cake className="w-12 h-12 text-pink-400" />
                  </div>
                </div>

                {/* Birthday List */}
                {data.data.total === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                      <Cake className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 mb-2">Nenhum aniversariante</p>
                    <p className="text-gray-400 text-sm">
                      Não há pacientes fazendo aniversário nesta data
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {data.data.birthdays.map((birthday, index) => (
                      <div
                        key={`${birthday.externalId}-${index}`}
                        className="p-4 border border-gray-200 rounded-lg hover:border-pink-300 hover:bg-pink-50/30 transition-all"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            {/* Name */}
                            <h4 className="font-semibold text-gray-900 truncate">
                              {birthday.name}
                            </h4>

                            {/* Info Grid */}
                            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">
                                  {birthday.birthDate} ({birthday.age} anos)
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-gray-600">
                                <Phone className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">{birthday.phone}</span>
                              </div>

                              {birthday.lastAppointment && (
                                <div className="col-span-2 text-xs text-gray-500">
                                  Último atendimento: {birthday.lastAppointment}
                                  {birthday.daysSinceLastAppointment && (
                                    <span className="ml-1">
                                      ({birthday.daysSinceLastAppointment} dias)
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col gap-2">
                            {birthday.patientId && (
                              <button
                                onClick={() => handlePatientClick(birthday.patientId!)}
                                className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm font-medium whitespace-nowrap"
                                title="Ver detalhes do paciente"
                              >
                                <User className="w-4 h-4" />
                                <span className="hidden sm:inline">Detalhes</span>
                              </button>
                            )}

                            {birthday.phone && (
                              <button
                                onClick={() => handleWhatsAppClick(birthday.phone)}
                                className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center gap-2 text-sm font-medium whitespace-nowrap"
                                title="Enviar mensagem no WhatsApp"
                              >
                                <Phone className="w-4 h-4" />
                                <span className="hidden sm:inline">WhatsApp</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};
