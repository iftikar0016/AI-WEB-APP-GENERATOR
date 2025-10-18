import { NextRequest, NextResponse } from 'next/server';
import { TaskRequestSchema } from '@/lib/types';
import { addTaskToQueue } from '@/lib/queue';

export const runtime = 'nodejs'; // Use Node.js runtime
export const maxDuration = 60; // Maximum execution time for Vercel (60s for Pro, 10s for Hobby)

/**
 * POST /api/api-endpoint
 * Main API endpoint for receiving evaluation requests
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate request with Zod schema
    const validationResult = TaskRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const taskRequest = validationResult.data;

    // Authentication check
    if (taskRequest.secret !== process.env.MY_SECRET) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    // Add task to background processing queue
    const job = await addTaskToQueue({ request: taskRequest });

    // Return immediate response with taskId for status polling
    return NextResponse.json(
      {
        status: 'processing',
        taskId: job.id,
        task: taskRequest.task,
        round: taskRequest.round,
        message: `Task '${taskRequest.task}' (Round ${taskRequest.round}) accepted and processing in background`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in /api/api-endpoint:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
