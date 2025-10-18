import type { ProcessTaskJobData, TaskStage } from './types';

// Simple in-memory queue (for development without Redis)
// WARNING: Jobs are lost on server restart. Use Redis for production!

interface QueueJob {
  id: string;
  data: ProcessTaskJobData;
  status: 'waiting' | 'active' | 'completed' | 'failed';
  stage: TaskStage;
  progress: number;
  message?: string;
  githubUrl?: string;
  pagesUrl?: string;
  commitSha?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

class InMemoryQueue {
  private jobs: Map<string, QueueJob> = new Map();
  private waitingJobs: QueueJob[] = [];
  private isProcessing = false;

  async add(jobData: ProcessTaskJobData): Promise<{ id: string }> {
    const id = `${jobData.request.task}-round-${jobData.request.round}-${jobData.request.nonce}`;
    
    const job: QueueJob = {
      id,
      data: jobData,
      status: 'waiting',
      stage: 'queued',
      progress: 0,
      message: 'Task queued',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.jobs.set(id, job);
    this.waitingJobs.push(job);

    console.log(`✓ Job added to in-memory queue: ${id}`);
    console.log(`✓ Total jobs in queue: ${this.jobs.size}`);

    // Start processing if not already running
    if (!this.isProcessing) {
      this.processNextJob();
    }

    return { id };
  }

  private async processNextJob() {
    if (this.waitingJobs.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    const job = this.waitingJobs.shift();

    if (!job) return;

    job.status = 'active';
    job.stage = 'generating-html';
    job.progress = 5;
    job.message = 'Starting task processing';
    job.updatedAt = new Date();
    console.log(`🚀 Processing job: ${job.id}`);

    try {
      // Dynamic import to avoid circular dependency
      const { processTaskInMemory } = await import('./queue-processor');
      await processTaskInMemory(job.data, (
        stage: TaskStage,
        progress: number,
        message: string,
        data?: { githubUrl?: string; pagesUrl?: string; commitSha?: string }
      ) => {
        // Update callback from processor
        job.stage = stage;
        job.progress = progress;
        job.message = message;
        job.updatedAt = new Date();
        if (data?.githubUrl) job.githubUrl = data.githubUrl;
        if (data?.pagesUrl) job.pagesUrl = data.pagesUrl;
        if (data?.commitSha) job.commitSha = data.commitSha;
      });
      
      job.status = 'completed';
      job.stage = 'completed';
      job.progress = 100;
      job.message = 'Task completed successfully';
      job.updatedAt = new Date();
      console.log(`✅ Job ${job.id} completed`);
    } catch (error) {
      job.status = 'failed';
      job.stage = 'failed';
      job.progress = 0;
      job.error = error instanceof Error ? error.message : String(error);
      job.message = 'Task failed';
      job.updatedAt = new Date();
      console.error(`❌ Job ${job.id} failed:`, error);
    }

    // Process next job
    setTimeout(() => this.processNextJob(), 100);
  }

  async getHealth() {
    const waiting = Array.from(this.jobs.values()).filter((j) => j.status === 'waiting').length;
    const active = Array.from(this.jobs.values()).filter((j) => j.status === 'active').length;
    const completed = Array.from(this.jobs.values()).filter((j) => j.status === 'completed')
      .length;
    const failed = Array.from(this.jobs.values()).filter((j) => j.status === 'failed').length;

    return { waiting, active, completed, failed };
  }

  getTaskStatus(taskId: string) {
    const job = this.jobs.get(taskId);
    console.log(`getTaskStatus called for: ${taskId}, found: ${!!job}, total jobs: ${this.jobs.size}`);
    
    if (!job) {
      return null;
    }

    return {
      taskId: job.id,
      status: job.status,
      stage: job.stage,
      progress: job.progress,
      message: job.message,
      githubUrl: job.githubUrl,
      pagesUrl: job.pagesUrl,
      commitSha: job.commitSha,
      error: job.error,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    };
  }
}

// Singleton instance using global to prevent multiple instances in dev mode
declare global {
  var __inMemoryQueue: InMemoryQueue | undefined;
}

const inMemoryQueue = global.__inMemoryQueue || new InMemoryQueue();

if (process.env.NODE_ENV !== 'production') {
  global.__inMemoryQueue = inMemoryQueue;
}

export async function addTaskToQueue(jobData: ProcessTaskJobData) {
  return inMemoryQueue.add(jobData);
}

export async function getQueueHealth() {
  return inMemoryQueue.getHealth();
}

export function getTaskStatus(taskId: string) {
  return inMemoryQueue.getTaskStatus(taskId);
}

if (!global.__inMemoryQueue) {
  console.log('⚠️  Using IN-MEMORY queue (development mode)');
  console.log('⚠️  Jobs will be lost on server restart');
  console.log('⚠️  For production, use Redis + BullMQ (see lib/queue-redis.ts)');
}
