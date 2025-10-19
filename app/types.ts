export interface HealthStatus {
  status: string;
  queue: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  };
}

export type TaskStatusState = 'waiting' | 'active' | 'completed' | 'failed';

export interface TaskStatus {
  taskId: string;
  status: TaskStatusState;
  stage: string;
  progress: number;
  message?: string;
  githubUrl?: string;
  pagesUrl?: string;
  commitSha?: string;
  error?: string;
}

export interface TaskFormData {
  secret: string;
  email: string;
  task: string;
  round: number;
  brief: string;
  nonce: string;
}
