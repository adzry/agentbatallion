/**
 * Code Cleanup Utility
 * 
 * Post-processes generated code to fix common issues
 * and improve quality scores
 * 
 * Safe, deterministic, and QA-aligned without corrupting valid TypeScript or TSX
 */

export interface CleanupResult {
  code: string;
  fixes: string[];
}

export interface CleanupOptions {
  removeConsole?: boolean;
  addIconButtonAriaLabel?: boolean;
  defaultIconButtonLabel?: string;
}

/**
 * Clean up TSX/JSX code (React components)
 */
export function cleanupTSX(code: string, options?: CleanupOptions): CleanupResult {
  const opts: Required<CleanupOptions> = {
    removeConsole: options?.removeConsole ?? true,
    addIconButtonAriaLabel: options?.addIconButtonAriaLabel ?? true,
    defaultIconButtonLabel: options?.defaultIconButtonLabel ?? 'Icon button',
  };

  const fixes: string[] = [];
  let cleaned = code;

  // 1. Button type safety - Add type="button" only if missing
  const buttonMatches = cleaned.match(/<button(?![^>]*type=)([^>]*)>/g);
  if (buttonMatches && buttonMatches.length > 0) {
    cleaned = cleaned.replace(
      /<button(?![^>]*type=)([^>]*)>/g,
      '<button type="button"$1>'
    );
    fixes.push(`Added type="button" to ${buttonMatches.length} button(s)`);
  }

  // 2. Image accessibility - Add alt="" only if missing
  const imgMatches = cleaned.match(/<img(?![^>]*alt=)([^>]*)>/g);
  if (imgMatches && imgMatches.length > 0) {
    cleaned = cleaned.replace(
      /<img(?![^>]*alt=)([^>]*)>/g,
      '<img alt=""$1>'
    );
    fixes.push(`Added alt="" to ${imgMatches.length} image(s)`);
  }

  // 3. Icon-only buttons - Add aria-label conservatively
  if (opts.addIconButtonAriaLabel) {
    // Match buttons that contain only SVG/icon elements and no visible text
    // This is conservative - only matches simple cases
    const iconOnlyPattern = /<button([^>]*)>([\s\n]*<(?:svg|Icon)[^>]*(?:\/>|>[\s\S]*?<\/(?:svg|Icon)>)[\s\n]*)<\/button>/g;
    let match;
    let addedLabels = 0;
    const matches: Array<{ original: string; attrs: string; content: string }> = [];
    
    // Collect all matches first to avoid infinite loop
    while ((match = iconOnlyPattern.exec(cleaned)) !== null) {
      matches.push({ original: match[0], attrs: match[1], content: match[2] });
    }
    
    for (const m of matches) {
      // Only add if no aria-label or aria-labelledby exists
      if (!m.attrs.includes('aria-label') && !m.attrs.includes('aria-labelledby')) {
        const replacement = `<button aria-label="${opts.defaultIconButtonLabel}"${m.attrs}>${m.content}</button>`;
        cleaned = cleaned.replace(m.original, replacement);
        addedLabels++;
      }
    }
    
    if (addedLabels > 0) {
      fixes.push(`Added aria-label to ${addedLabels} icon-only button(s)`);
    }
  }

  // 4. Console statement removal (single-line only, TSX/JSX)
  if (opts.removeConsole) {
    const consolePattern = /^\s*console\.(log|debug|info|warn|error)\([^)]*\);?\s*$/gm;
    const consoleMatches = cleaned.match(consolePattern);
    if (consoleMatches && consoleMatches.length > 0) {
      cleaned = cleaned.replace(consolePattern, '');
      fixes.push(`Removed ${consoleMatches.length} console statement(s)`);
    }
  }

  // 5. ClassName normalization (safe)
  // Remove empty className attributes
  const emptyClassMatches = cleaned.match(/className=""/g);
  if (emptyClassMatches && emptyClassMatches.length > 0) {
    cleaned = cleaned.replace(/className=""/g, '');
    fixes.push(`Removed ${emptyClassMatches.length} empty className attribute(s)`);
  }
  
  // Normalize whitespace inside className (preserve content)
  cleaned = cleaned.replace(/className="([^"]*)"/g, (match, classes) => {
    const normalized = classes.replace(/\s+/g, ' ').trim();
    return normalized ? `className="${normalized}"` : '';
  });

  // 6. Markdown cleanup - Strip leading/trailing code fences
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:tsx|typescript|javascript|jsx)?\n?/, '');
    fixes.push('Removed leading code fence');
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.replace(/```$/, '');
    fixes.push('Removed trailing code fence');
  }

  // 7. Whitespace cleanup - Trim trailing whitespace per line
  cleaned = cleaned.split('\n').map(line => line.trimEnd()).join('\n').trim();

  return { code: cleaned, fixes };
}

/**
 * Clean up TS/JS code (non-JSX)
 */
export function cleanupTS(code: string, options?: CleanupOptions): CleanupResult {
  const opts: Required<CleanupOptions> = {
    removeConsole: options?.removeConsole ?? false,
    addIconButtonAriaLabel: false, // Never for non-JSX
    defaultIconButtonLabel: '',
  };

  const fixes: string[] = [];
  let cleaned = code;

  // 1. Console statement removal (opt-in only for TS/JS)
  if (opts.removeConsole) {
    const consolePattern = /^\s*console\.(log|debug|info|warn|error)\([^)]*\);?\s*$/gm;
    const consoleMatches = cleaned.match(consolePattern);
    if (consoleMatches && consoleMatches.length > 0) {
      cleaned = cleaned.replace(consolePattern, '');
      fixes.push(`Removed ${consoleMatches.length} console statement(s)`);
    }
  }

  // 2. Markdown cleanup - Strip leading/trailing code fences
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:ts|typescript|javascript|js)?\n?/, '');
    fixes.push('Removed leading code fence');
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.replace(/```$/, '');
    fixes.push('Removed trailing code fence');
  }

  // 3. Whitespace cleanup - Trim trailing whitespace per line
  cleaned = cleaned.split('\n').map(line => line.trimEnd()).join('\n').trim();

  return { code: cleaned, fixes };
}

/**
 * Clean up CSS code
 */
export function cleanupCSS(code: string): CleanupResult {
  const fixes: string[] = [];
  let cleaned = code;

  // Remove markdown code fences
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:css)?\n?/, '');
    fixes.push('Removed leading code fence');
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.replace(/```$/, '');
    fixes.push('Removed trailing code fence');
  }

  // Trim trailing whitespace per line
  cleaned = cleaned.split('\n').map(line => line.trimEnd()).join('\n').trim();

  return { code: cleaned, fixes };
}

/**
 * Clean up JSON code
 */
export function cleanupJSON(code: string): CleanupResult {
  const fixes: string[] = [];
  let cleaned = code;

  // Remove markdown code fences
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '');
    fixes.push('Removed leading code fence');
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.replace(/```$/, '');
    fixes.push('Removed trailing code fence');
  }

  try {
    // Parse and re-stringify to fix formatting
    const parsed = JSON.parse(cleaned);
    cleaned = JSON.stringify(parsed, null, 2);
    fixes.push('Formatted JSON');
  } catch {
    // JSON is invalid, leave as is
    // Don't add a fix message unless we actually changed something
  }

  return { code: cleaned, fixes };
}

/**
 * Apply cleanup based on file extension
 */
export function cleanupCode(code: string, filePath: string, options?: CleanupOptions): CleanupResult {
  const ext = filePath.split('.').pop()?.toLowerCase();

  switch (ext) {
    case 'tsx':
    case 'jsx':
      // TSX/JSX files get full JSX cleanup with default options
      return cleanupTSX(code, options);
    
    case 'ts':
    case 'js':
      // TS/JS files get non-JSX cleanup (no console removal by default)
      return cleanupTS(code, options);
    
    case 'css':
      return cleanupCSS(code);
    
    case 'json':
      return cleanupJSON(code);
    
    default:
      // Unknown file types are left unchanged
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
