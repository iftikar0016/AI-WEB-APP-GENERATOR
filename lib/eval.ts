import type { EvaluationPayload } from './types';

/**
 * Send evaluation payload with exponential backoff retry mechanism
 */
export async function sendEvaluationWithRetry(
  evaluationUrl: string,
  payload: EvaluationPayload,
  timeoutMinutes: number = 10
): Promise<boolean> {
  const deadline = new Date(Date.now() + timeoutMinutes * 60 * 1000);
  let retryDelay = 1000; // Start with 1 second
  const maxRetryDelay = 60000; // Cap at 60 seconds

  while (Date.now() < deadline.getTime()) {
    try {
      const response = await fetch(evaluationUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(30000), // 30 second timeout per request
      });

      if (response.ok) {
        console.log(`✓ Successfully notified evaluation server: ${response.status}`);
        return true;
      } else {
        const text = await response.text();
        console.log(`✗ Evaluation server returned ${response.status}: ${text}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`✗ Error sending evaluation: ${errorMessage}`);
    }

    // Calculate time remaining
    const timeRemaining = deadline.getTime() - Date.now();

    if (timeRemaining <= 0) {
      console.log('✗ Timeout reached, stopping retries');
      break;
    }

    // Wait before retry (exponential backoff)
    const waitTime = Math.min(retryDelay, timeRemaining);
    console.log(`⟳ Retrying in ${waitTime / 1000} seconds...`);
    
    await new Promise((resolve) => setTimeout(resolve, waitTime));

    // Exponential backoff
    retryDelay = Math.min(retryDelay * 2, maxRetryDelay);
  }

  console.log('✗ Failed to notify evaluation server within timeout period');
  return false;
}
