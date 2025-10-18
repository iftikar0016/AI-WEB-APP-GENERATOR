import { z } from 'zod';

// Zod schemas for runtime validation
export const AttachmentSchema = z.object({
  name: z.string(),
  url: z.string().url(),
});

export const TaskRequestSchema = z.object({
  email: z.string().email(),
  secret: z.string(),
  task: z.string(),
  round: z.number().int().min(1).max(2),
  nonce: z.string(),
  brief: z.string(),
  checks: z.array(z.string()).optional().default([]),
  evaluation_url: z.string().url(),
  attachments: z.array(AttachmentSchema).optional(),
});

export const EvaluationPayloadSchema = z.object({
  email: z.string().email(),
  task: z.string(),
  round: z.number().int().min(1).max(2),
  nonce: z.string(),
  repo_url: z.string().url(),
  commit_sha: z.string(),
  pages_url: z.string().url(),
});

// TypeScript types inferred from schemas
export type Attachment = z.infer<typeof AttachmentSchema>;
export type TaskRequest = z.infer<typeof TaskRequestSchema>;
export type EvaluationPayload = z.infer<typeof EvaluationPayloadSchema>;

// Additional types
export interface LLMResult {
  html: string;
  readme: string;
}

export interface ProcessTaskJobData {
  request: TaskRequest;
}

export interface GitHubFileCommit {
  sha: string;
  content: {
    sha: string;
  };
  commit: {
    sha: string;
  };
}

export interface Settings {
  MY_SECRET: string;
  GITHUB_TOKEN: string;
  GITHUB_USERNAME: string;
  AIPIPE_TOKEN: string;
  OPENAI_BASE_URL: string;
}
