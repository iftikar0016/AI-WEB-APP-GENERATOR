import { Octokit } from '@octokit/rest';

/**
 * Generate MIT License content
 */
export function createMitLicense(githubUsername: string): string {
  const year = new Date().getFullYear();

  return `MIT License

Copyright (c) ${year} ${githubUsername}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;
}

/**
 * Create GitHub repository
 */
export async function createGitHubRepo(
  octokit: Octokit,
  repoName: string,
  description: string
) {
  try {
    const { data } = await octokit.repos.createForAuthenticatedUser({
      name: repoName,
      description,
      private: false,
      auto_init: false,
    });
    
    console.log(`✓ Repository created: ${data.html_url}`);
    return data;
  } catch (error: any) {
    if (error.status === 422) {
      // Repository already exists
      console.log(`! Repository already exists, fetching existing repo...`);
      const { data } = await octokit.repos.get({
        owner: process.env.GITHUB_USERNAME!,
        repo: repoName,
      });
      return data;
    }
    throw error;
  }
}

/**
 * Create or update a file in a GitHub repository
 */
export async function createOrUpdateFile(
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string,
  content: string,
  message: string,
  branch: string = 'main'
): Promise<string> {
  try {
    // Try to get existing file
    const { data: existingFile } = await octokit.repos.getContent({
      owner,
      repo,
      path,
      ref: branch,
    });

    // File exists, update it
    if ('sha' in existingFile) {
      const { data } = await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message: `Update ${path}`,
        content: Buffer.from(content).toString('base64'),
        sha: existingFile.sha,
        branch,
      });

      console.log(`✓ Updated ${path}`);
      return data.commit.sha!;
    }
  } catch (error: any) {
    // File doesn't exist (404), create it
    if (error.status === 404) {
      const { data } = await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message,
        content: Buffer.from(content).toString('base64'),
        branch,
      });

      console.log(`✓ Committed ${path}`);
      return data.commit.sha!;
    }
    throw error;
  }

  throw new Error(`Failed to create or update file: ${path}`);
}

/**
 * Get file content from GitHub repository
 */
export async function getFileContent(
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string,
  branch: string = 'main'
): Promise<string> {
  const { data } = await octokit.repos.getContent({
    owner,
    repo,
    path,
    ref: branch,
  });

  if ('content' in data) {
    return Buffer.from(data.content, 'base64').toString('utf-8');
  }

  throw new Error(`File not found or is a directory: ${path}`);
}

/**
 * Enable GitHub Pages for a repository
 */
export async function enableGitHubPages(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<void> {
  try {
    await octokit.request('POST /repos/{owner}/{repo}/pages', {
      owner,
      repo,
      source: {
        branch: 'main',
        path: '/',
      },
    });
    console.log('✓ GitHub Pages enabled');
  } catch (error: any) {
    if (error.status === 409) {
      console.log('! GitHub Pages already enabled');
    } else {
      console.warn(
        `✗ Warning: Could not enable Pages (status ${error.status}): ${error.message}`
      );
    }
  }
}

/**
 * Calculate GitHub Pages URL
 */
export function getGitHubPagesUrl(owner: string, repo: string): string {
  return `https://${owner}.github.io/${repo}/`;
}
