/**
 * Simple In-Memory Queue
 * 
 * Processes tasks immediately in the same request context.
 * Perfect for serverless deployments (Vercel).
 * 
 * Note: Long-running tasks may hit serverless timeout limits.
 */

export { addTaskToQueue, getQueueHealth, getTaskStatus } from './queue-memory';
