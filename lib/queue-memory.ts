import type { ProcessTaskJobData } from './types';

// Simple in-memory queue (for development without Redis)
// WARNING: Jobs are lost on server restart. Use Redis for production!

interface QueueJob {
  id: string;
  data: ProcessTaskJobData;
  status: 'waiting' | 'active' | 'completed' | 'failed';
  error?: string;
  createdAt: Date;
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
      createdAt: new Date(),
    };

    this.jobs.set(id, job);
    this.waitingJobs.push(job);

    console.log(`✓ Job added to in-memory queue: ${id}`);

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
    console.log(`🚀 Processing job: ${job.id}`);

    try {
      // Dynamic import to avoid circular dependency
      const { processTaskInMemory } = await import('./queue-processor');
      await processTaskInMemory(job.data);
      
      job.status = 'completed';
      console.log(`✅ Job ${job.id} completed`);
    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : String(error);
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
}

// Singleton instance
const inMemoryQueue = new InMemoryQueue();

export async function addTaskToQueue(jobData: ProcessTaskJobData) {
  return inMemoryQueue.add(jobData);
}

export async function getQueueHealth() {
  return inMemoryQueue.getHealth();
}

console.log('⚠️  Using IN-MEMORY queue (development mode)');
console.log('⚠️  Jobs will be lost on server restart');
console.log('⚠️  For production, use Redis + BullMQ (see lib/queue-redis.ts)');
