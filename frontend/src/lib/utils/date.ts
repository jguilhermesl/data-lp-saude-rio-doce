/**
 * Converte uma data local para ISO string sem alterar o timezone
 * Exemplo: 30/01/2026 23:59:59 (local) -> "2026-01-30T23:59:59.000Z"
 * Sem essa função, seria convertido para UTC: "2026-01-31T02:59:59.000Z"
 */
export const toLocalISOString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`;
};

/**
 * Retorna a data local no formato YYYY-MM-DD sem conversão de timezone
 * Útil para inputs do tipo date
 * Exemplo: 30/01/2026 (local) -> "2026-01-30"
 */
export const toLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};
