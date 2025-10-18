import { Octokit } from '@octokit/rest';
import type { ProcessTaskJobData, TaskRequest } from './types';
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

/**
 * Process Round 1: Initial Build & Deployment
 */
async function processTaskRound1(request: TaskRequest, octokit: Octokit, owner: string) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`ROUND 1: Initial Build & Deployment`);
  console.log(`Task: ${request.task}`);
  console.log(`${'='.repeat(60)}\n`);

  // Step 1: Generate HTML and README with OpenAI
  console.log('→ Generating HTML application and README with OpenAI API...');
  const result = await generateHtmlWithLLM(request.brief, request.attachments);
  console.log(`✓ Generated ${result.html.length} characters of HTML`);
  console.log(`✓ Generated ${result.readme.length} characters of README`);

  // Step 2: Create GitHub repository
  console.log(`\n→ Creating GitHub repository: ${request.task}`);
  const repo = await createGitHubRepo(
    octokit,
    request.task,
    `Web application: ${request.brief.substring(0, 100)}...`
  );

  // Step 3: Create and commit files
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
  console.log('\n→ Enabling GitHub Pages...');
  await enableGitHubPages(octokit, owner, request.task);

  const pagesUrl = getGitHubPagesUrl(owner, request.task);
  console.log(`✓ Pages URL: ${pagesUrl}`);

  // Step 5: Send evaluation payload
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

  console.log(`\n${'='.repeat(60)}`);
  console.log(`ROUND 1 COMPLETED SUCCESSFULLY`);
  console.log(`${'='.repeat(60)}\n`);
}

/**
 * Process Round 2: Revision & Update
 */
async function processTaskRound2(request: TaskRequest, octokit: Octokit, owner: string) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`ROUND 2: Revision & Update`);
  console.log(`Task: ${request.task}`);
  console.log(`${'='.repeat(60)}\n`);

  // Step 1: Retrieve existing repository and code
  console.log(`→ Fetching repository: ${request.task}`);
  const { data: repo } = await octokit.repos.get({
    owner,
    repo: request.task,
  });
  console.log(`✓ Repository found: ${repo.html_url}`);

  // Get current index.html
  console.log('\n→ Retrieving current index.html...');
  const existingHtml = await getFileContent(octokit, owner, request.task, 'index.html');
  console.log(`✓ Retrieved ${existingHtml.length} characters`);

  // Step 2: Generate updated HTML and README with OpenAI
  console.log('\n→ Generating updated HTML and README with OpenAI API...');
  const result = await generateHtmlWithLLM(request.brief, request.attachments, existingHtml);
  console.log(`✓ Generated ${result.html.length} characters of updated HTML`);
  console.log(`✓ Generated ${result.readme.length} characters of updated README`);

  // Step 3: Update files in repository
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

  // Step 4: Send evaluation payload
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

  console.log(`\n${'='.repeat(60)}`);
  console.log(`ROUND 2 COMPLETED SUCCESSFULLY`);
  console.log(`${'='.repeat(60)}\n`);
}

/**
 * Main task processing function for in-memory queue
 */
export async function processTaskInMemory(jobData: ProcessTaskJobData) {
  const { request } = jobData;

  console.log(`\n🚀 Processing task: ${request.task}, Round: ${request.round}`);

  // Initialize GitHub client
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  const owner = process.env.GITHUB_USERNAME!;

  try {
    if (request.round === 1) {
      await processTaskRound1(request, octokit, owner);
    } else if (request.round === 2) {
      await processTaskRound2(request, octokit, owner);
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
