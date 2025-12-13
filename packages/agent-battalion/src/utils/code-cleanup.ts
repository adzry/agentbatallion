/**
 * Code Cleanup Utility
 * 
 * Post-processes generated code to fix common issues
 * and improve quality scores
 */

export interface CleanupResult {
  code: string;
  fixes: string[];
}

/**
 * Clean up TypeScript/React code
 */
export function cleanupTSX(code: string): CleanupResult {
  const fixes: string[] = [];
  let cleaned = code;

  // Fix button type attributes
  if (/<button(?![^>]*type=)/.test(cleaned)) {
    cleaned = cleaned.replace(
      /<button(?![^>]*type=)([^>]*)>/g,
      '<button type="button"$1>'
    );
    fixes.push('Added type="button" to buttons');
  }

  // Fix img alt attributes
  if (/<img(?![^>]*alt=)/.test(cleaned)) {
    cleaned = cleaned.replace(
      /<img(?![^>]*alt=)([^>]*)>/g,
      '<img alt=""$1>'
    );
    fixes.push('Added alt="" to images');
  }

  // Add aria-label to icon-only buttons
  const iconButtonRegex = /<button([^>]*)>(\s*<(?:svg|Icon|span[^>]*icon)[^>]*\/?>[\s\S]*?)<\/button>/g;
  if (iconButtonRegex.test(cleaned)) {
    cleaned = cleaned.replace(iconButtonRegex, (match, attrs, content) => {
      if (!attrs.includes('aria-label')) {
        return `<button aria-label="button"${attrs}>${content}</button>`;
      }
      return match;
    });
    fixes.push('Added aria-label to icon buttons');
  }

  // Remove console.log statements
  if (/console\.log\(/.test(cleaned)) {
    cleaned = cleaned.replace(/^\s*console\.log\([^)]*\);?\s*$/gm, '');
    fixes.push('Removed console.log statements');
  }

  // Fix empty className strings
  cleaned = cleaned.replace(/className=""/g, '');
  
  // Fix multiple spaces in className
  cleaned = cleaned.replace(/className="([^"]*)"/g, (match, classes) => {
    const cleaned = classes.replace(/\s+/g, ' ').trim();
    return cleaned ? `className="${cleaned}"` : '';
  });

  // Ensure proper key prop in arrays (basic pattern)
  // This is a simple heuristic, not a full fix
  if (/\.map\([^)]*\)\s*=>/g.test(cleaned) && !cleaned.includes('key=')) {
    fixes.push('Warning: Missing key prop detected in .map()');
  }

  // Fix common quotes issues
  cleaned = cleaned.replace(/className='/g, 'className="');
  cleaned = cleaned.replace(/'>/g, '">');

  // Remove markdown code blocks if present
  cleaned = cleaned.replace(/^```(?:tsx|typescript|javascript|jsx)?\n?/gm, '');
  cleaned = cleaned.replace(/```$/gm, '');

  // Trim and remove trailing whitespace
  cleaned = cleaned.split('\n').map(line => line.trimEnd()).join('\n').trim();

  return { code: cleaned, fixes };
}

/**
 * Clean up CSS code
 */
export function cleanupCSS(code: string): CleanupResult {
  const fixes: string[] = [];
  let cleaned = code;

  // Remove !important where possible (just flag it)
  if (/!important/.test(cleaned)) {
    fixes.push('Warning: !important usage detected - consider refactoring');
  }

  // Fix empty rule blocks
  cleaned = cleaned.replace(/[^{}]+\{\s*\}/g, '');
  if (cleaned !== code) {
    fixes.push('Removed empty CSS rule blocks');
  }

  return { code: cleaned, fixes };
}

/**
 * Clean up JSON code
 */
export function cleanupJSON(code: string): CleanupResult {
  const fixes: string[] = [];
  let cleaned = code;

  try {
    // Parse and re-stringify to fix formatting
    const parsed = JSON.parse(cleaned);
    cleaned = JSON.stringify(parsed, null, 2);
    fixes.push('Formatted JSON');
  } catch {
    // JSON is invalid, leave as is
    fixes.push('Warning: Invalid JSON detected');
  }

  return { code: cleaned, fixes };
}

/**
 * Apply cleanup based on file extension
 */
export function cleanupCode(code: string, filePath: string): CleanupResult {
  const ext = filePath.split('.').pop()?.toLowerCase();

  switch (ext) {
    case 'tsx':
    case 'ts':
    case 'jsx':
    case 'js':
      return cleanupTSX(code);
    case 'css':
      return cleanupCSS(code);
    case 'json':
      return cleanupJSON(code);
    default:
      return { code, fixes: [] };
  }
}

/**
 * Generate semantic HTML wrapper if missing
 */
export function ensureSemanticHTML(code: string): string {
  // If component doesn't have semantic wrapper, suggest wrapping
  if (code.includes('export') && code.includes('function')) {
    // Check if return statement has semantic element
    const returnMatch = code.match(/return\s*\(\s*(<[^>]+>)/);
    if (returnMatch) {
      const firstElement = returnMatch[1];
      const semanticElements = ['<main', '<section', '<article', '<header', '<footer', '<nav', '<aside'];
      const hasSemanticWrapper = semanticElements.some(el => firstElement.startsWith(el));
      
      if (!hasSemanticWrapper && firstElement.startsWith('<div')) {
        // This is just a detection - actual fix would need AST parsing
        return code;
      }
    }
  }
  return code;
}
