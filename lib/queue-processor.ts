import { Octokit } from '@octokit/rest';
import type { ProcessTaskJobData, TaskRequest, TaskStage } from './types';
import { generateHtmlWithLLM } from './llm';
import {
  createGitHubRepo,
  createOrUpdateFile,
  getFileContent,
  createMitLicense,
  enableGitHubPages,
  getGitHubPagesUrl,
} from './github';
import { sendEvaluationWithRetry } from './eval';

type ProgressCallback = (
  stage: TaskStage,
  progress: number,
  message: string,
  data?: { githubUrl?: string; pagesUrl?: string; commitSha?: string }
) => void;

/**
 * Process Round 1: Initial Build & Deployment
 */
async function processTaskRound1(
  request: TaskRequest,
  octokit: Octokit,
  owner: string,
  onProgress: ProgressCallback
) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`ROUND 1: Initial Build & Deployment`);
  console.log(`Task: ${request.task}`);
  console.log(`${'='.repeat(60)}\n`);

  // Step 1: Generate HTML and README with OpenAI
  onProgress('generating-html', 10, 'Generating HTML application with AI...');
  console.log('→ Generating HTML application and README with OpenAI API...');
  const result = await generateHtmlWithLLM(request.brief, request.attachments);
  console.log(`✓ Generated ${result.html.length} characters of HTML`);
  console.log(`✓ Generated ${result.readme.length} characters of README`);

  // Step 2: Create GitHub repository
  onProgress('creating-repo', 30, 'Creating GitHub repository...');
  console.log(`\n→ Creating GitHub repository: ${request.task}`);
  const repo = await createGitHubRepo(
    octokit,
    request.task,
    `Web application: ${request.brief.substring(0, 100)}...`
  );
  const githubUrl = repo.html_url;
  onProgress('creating-repo', 40, 'Repository created successfully', { githubUrl });

  // Step 3: Create and commit files
  onProgress('committing-files', 50, 'Committing files to repository...');
  console.log('\n→ Committing files to repository...');

  // Commit index.html
  await createOrUpdateFile(
    octokit,
    owner,
    request.task,
    'index.html',
    result.html,
    'Initial commit: Add index.html'
  );

  // Commit LICENSE
  const licenseContent = createMitLicense(owner);
  await createOrUpdateFile(
    octokit,
    owner,
    request.task,
    'LICENSE',
    licenseContent,
    'Add MIT License'
  );

  // Commit README.md
  const commitSha = await createOrUpdateFile(
    octokit,
    owner,
    request.task,
    'README.md',
    result.readme,
    'Add comprehensive README'
  );
  console.log(`✓ Committed README.md (SHA: ${commitSha.substring(0, 7)})`);

  // Step 4: Enable GitHub Pages
  onProgress('enabling-pages', 70, 'Enabling GitHub Pages...');
  console.log('\n→ Enabling GitHub Pages...');
  await enableGitHubPages(octokit, owner, request.task);

  const pagesUrl = getGitHubPagesUrl(owner, request.task);
  console.log(`✓ Pages URL: ${pagesUrl}`);
  onProgress('enabling-pages', 80, 'GitHub Pages enabled', { githubUrl, pagesUrl, commitSha });

  // Step 5: Send evaluation payload (if URL provided)
  if (request.evaluation_url) {
    onProgress('sending-evaluation', 90, 'Sending evaluation to server...');
    console.log('\n→ Sending evaluation to server...');
    await sendEvaluationWithRetry(request.evaluation_url, {
      email: request.email,
      task: request.task,
      round: 1,
      nonce: request.nonce,
      repo_url: repo.html_url,
      commit_sha: commitSha,
      pages_url: pagesUrl,
    });
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`ROUND 1 COMPLETED SUCCESSFULLY`);
  console.log(`${'='.repeat(60)}\n`);
}

/**
 * Process Round 2: Revision & Update
 */
async function processTaskRound2(
  request: TaskRequest,
  octokit: Octokit,
  owner: string,
  onProgress: ProgressCallback
) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`ROUND 2: Revision & Update`);
  console.log(`Task: ${request.task}`);
  console.log(`${'='.repeat(60)}\n`);

  // Step 1: Retrieve existing repository and code
  onProgress('fetching-repo', 10, 'Fetching repository...');
  console.log(`→ Fetching repository: ${request.task}`);
  const { data: repo } = await octokit.repos.get({
    owner,
    repo: request.task,
  });
  console.log(`✓ Repository found: ${repo.html_url}`);
  const githubUrl = repo.html_url;

  // Get current index.html
  onProgress('fetching-repo', 20, 'Retrieving current code...');
  console.log('\n→ Retrieving current index.html...');
  const existingHtml = await getFileContent(octokit, owner, request.task, 'index.html');
  console.log(`✓ Retrieved ${existingHtml.length} characters`);

  // Step 2: Generate updated HTML and README with OpenAI
  onProgress('generating-html', 40, 'Generating updated HTML with AI...');
  console.log('\n→ Generating updated HTML and README with OpenAI API...');
  const result = await generateHtmlWithLLM(request.brief, request.attachments, existingHtml);
  console.log(`✓ Generated ${result.html.length} characters of updated HTML`);
  console.log(`✓ Generated ${result.readme.length} characters of updated README`);

  // Step 3: Update files in repository
  onProgress('updating-files', 60, 'Updating files in repository...');
  console.log('\n→ Updating files in repository...');

  // Update index.html
  await createOrUpdateFile(
    octokit,
    owner,
    request.task,
    'index.html',
    result.html,
    `Round 2: Update application - ${request.brief.substring(0, 50)}...`
  );

  // Update README.md
  const commitSha = await createOrUpdateFile(
    octokit,
    owner,
    request.task,
    'README.md',
    result.readme,
    'Update README for Round 2'
  );
  console.log(`✓ Updated README.md (SHA: ${commitSha.substring(0, 7)})`);

  const pagesUrl = getGitHubPagesUrl(owner, request.task);
  onProgress('updating-files', 80, 'Files updated successfully', { githubUrl, pagesUrl, commitSha });

  // Step 4: Send evaluation payload (if URL provided)
  if (request.evaluation_url) {
    onProgress('sending-evaluation', 90, 'Sending evaluation to server...');
    console.log('\n→ Sending evaluation to server...');
    await sendEvaluationWithRetry(request.evaluation_url, {
      email: request.email,
      task: request.task,
      round: 2,
      nonce: request.nonce,
      repo_url: repo.html_url,
      commit_sha: commitSha,
      pages_url: pagesUrl,
    });
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`ROUND 2 COMPLETED SUCCESSFULLY`);
  console.log(`${'='.repeat(60)}\n`);
}

/**
 * Main task processing function for in-memory queue
 */
export async function processTaskInMemory(
  jobData: ProcessTaskJobData,
  onProgress: ProgressCallback
) {
  const { request } = jobData;

  console.log(`\n🚀 Processing task: ${request.task}, Round: ${request.round}`);

  // Initialize GitHub client
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  const owner = process.env.GITHUB_USERNAME!;

  try {
    if (request.round === 1) {
      await processTaskRound1(request, octokit, owner, onProgress);
    } else if (request.round === 2) {
      await processTaskRound2(request, octokit, owner, onProgress);
    } else {
      throw new Error(`Invalid round number: ${request.round}`);
    }

    console.log(`✓ Task completed successfully\n`);
  } catch (error) {
    console.error(`\n✗ FATAL ERROR in task processing:`);
    console.error(error);
    throw error;
  }
}
