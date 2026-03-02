/**
 * Queue Utils - Sistema de fila com delay entre processamentos
 */

/**
 * Aguarda um determinado tempo em milissegundos
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Processa items de uma fila com delay entre cada item
 */
export async function processQueueWithDelay<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R>,
  delayMs: number = 2000
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    
    console.log(`Processing item ${i + 1}/${items.length}...`);
    
    try {
      const result = await processor(item, i);
      results.push(result);
      
      // Aplica delay apenas se não for o último item
      if (i < items.length - 1) {
        console.log(`Waiting ${delayMs}ms before next item...`);
        await delay(delayMs);
      }
    } catch (error) {
      console.error(`Error processing item ${i + 1}:`, error);
      throw error;
    }
  }

  return results;
}

/**
 * Processa items em lotes (batches) com delay entre lotes
 */
export async function processBatchQueueWithDelay<T, R>(
  items: T[],
  processor: (batch: T[], batchIndex: number) => Promise<R[]>,
  batchSize: number,
  delayMs: number = 2000
): Promise<R[]> {
  const results: R[] = [];
  const batches: T[][] = [];

  // Divide items em batches
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }

  // Processa cada batch
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    
    console.log(`Processing batch ${i + 1}/${batches.length} (${batch.length} items)...`);
    
    try {
      const batchResults = await processor(batch, i);
      results.push(...batchResults);
      
      // Aplica delay apenas se não for o último batch
      if (i < batches.length - 1) {
        console.log(`Waiting ${delayMs}ms before next batch...`);
        await delay(delayMs);
      }
    } catch (error) {
      console.error(`Error processing batch ${i + 1}:`, error);
      throw error;
    }
  }

  return results;
}

/**
 * Retry com backoff exponencial
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelayMs: number = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries - 1) {
        const delayMs = initialDelayMs * Math.pow(2, attempt);
        console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delayMs}ms...`);
        await delay(delayMs);
      }
    }
  }

  throw lastError;
}
