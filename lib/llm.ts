import OpenAI from 'openai';
import type { Attachment, LLMResult } from './types';

/**
 * Strip code block markers (triple backticks) from LLM response
 */
function stripCodeBlock(text: string): string {
  if (!text.includes('```')) {
    return text.trim();
  }

  const parts = text.split('```');
  if (parts.length >= 2) {
    // Handle language tags like ```html or ```markdown
    let inner = parts[1].trim();
    
    // Remove language tag if present at start
    if (inner.includes('\n')) {
      const lines = inner.split('\n');
      const firstLine = lines[0].trim();
      
      if (['html', 'markdown', 'md'].includes(firstLine.toLowerCase())) {
        inner = lines.slice(1).join('\n').trim();
      }
    }
    
    return inner;
  }

  return text.trim();
}

/**
 * Generate HTML application and README using OpenAI API via AI Pipe
 */
export async function generateHtmlWithLLM(
  brief: string,
  attachments: Attachment[] | undefined,
  existingCode?: string
): Promise<LLMResult> {
  // Initialize OpenAI client with AI Pipe configuration
  const openai = new OpenAI({
    apiKey: process.env.AIPIPE_TOKEN!,
    baseURL: process.env.OPENAI_BASE_URL || 'https://aipipe.org/openrouter/v1',
  });

  // Prepare attachment info if present
  let attachmentsInfo = '';
  if (attachments && attachments.length > 0) {
    attachmentsInfo =
      '\n\nAttachments:\n' + attachments.map((att) => `- ${att.name}: ${att.url}`).join('\n');
  }

  let prompt: string;

  if (existingCode) {
    // Round 2: Revision prompt
    prompt = `You are a professional web developer assistant.

### Task: Round 2 - Code Revision
Update the existing application to satisfy this new requirement: ${brief}

### Current Code:
${existingCode}

${attachmentsInfo}

### Output Format (CRITICAL):
You must output TWO parts separated by exactly this line: ---README.md---

1. First part: Complete updated HTML file (index.html) with all HTML, CSS, and JavaScript
2. Separator: ---README.md---
3. Second part: Updated README.md that describes the NEW features and changes made in Round 2

The README must include:
- Project title
- Summary of what the app does (based on actual code)
- Key features (list what's actually implemented)
- Setup instructions
- Usage instructions
- Technical details (HTML/CSS/JS structure)
- Changes made in Round 2
- Deployment info (GitHub Pages)
- License (MIT)

Output format:
<your complete HTML code here>

---README.md---
<your complete README.md here>
`;
  } else {
    // Round 1: Initial generation prompt
    const currentDate = new Date().toISOString().split('T')[0];
    
    prompt = `You are a professional web developer assistant.

### Task: Round 1 - New Application
Create a fully functional single-file HTML web application based on this brief:

${brief}

${attachmentsInfo}

### Requirements:
- Create a complete, self-contained HTML file (index.html)
- Include all HTML, CSS (in <style> tags), and JavaScript (in <script> tags) in one file
- The application should be fully functional and ready to deploy
- Use modern web standards and best practices
- Make it visually appealing and user-friendly

### Output Format (CRITICAL):
You must output TWO parts separated by exactly this line: ---README.md---

1. First part: Complete HTML file (index.html)
2. Separator: ---README.md---
3. Second part: Professional README.md

The README must include:
- Project title
- Summary of what the app does (based on actual code you wrote)
- Key features (list what you actually implemented)
- Setup instructions
- Usage instructions
- Technical details (HTML/CSS/JS structure)
- Deployment info (GitHub Pages)
- License (MIT)
- Generated date: ${currentDate}

Output format:
<your complete HTML code here>

---README.md---
<your complete README.md here>
`;
  }

  try {
    // Call OpenAI API via AI Pipe proxy
    const response = await openai.chat.completions.create({
      model: 'openai/gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    const fullResponse = response.choices[0]?.message?.content || '';

    // Split into HTML and README parts
    if (fullResponse.includes('---README.md---')) {
      const [htmlPart, readmePart] = fullResponse.split('---README.md---', 2);
      
      const htmlContent = stripCodeBlock(htmlPart);
      const readmeContent = stripCodeBlock(readmePart);
      
      console.log(
        `✓ Successfully split response into HTML (${htmlContent.length} chars) and README (${readmeContent.length} chars)`
      );

      return {
        html: htmlContent,
        readme: readmeContent,
      };
    } else {
      // Fallback: try to extract HTML and generate simple README
      console.warn(
        '⚠ Warning: Response did not contain ---README.md--- separator, using fallback'
      );
      
      const htmlContent = stripCodeBlock(fullResponse);
      const currentDate = new Date().toISOString().split('T')[0];
      
      const readmeContent = `# Application

## Summary
${brief}

## Setup
Open \`index.html\` in a web browser.

## License
MIT License

---
*Generated on ${currentDate}*
`;

      return {
        html: htmlContent,
        readme: readmeContent,
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`OpenAI API error: ${errorMessage}`);
  }
}
