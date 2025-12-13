/**
 * Tests for Code Cleanup Utility
 */

import { describe, it, expect } from 'vitest';
import { cleanupTSX, cleanupTS, cleanupCSS, cleanupJSON, cleanupCode } from '../utils/code-cleanup.js';

describe('Code Cleanup', () => {
  describe('cleanupTSX', () => {
    it('should add type="button" to buttons without type', () => {
      const code = '<button onClick={handleClick}>Click me</button>';
      const result = cleanupTSX(code);
      
      expect(result.code).toContain('type="button"');
      expect(result.fixes).toContain('Added type="button" to 1 button(s)');
    });

    it('should not override existing button type', () => {
      const code = '<button type="submit" onClick={handleClick}>Submit</button>';
      const result = cleanupTSX(code);
      
      expect(result.code).toContain('type="submit"');
      expect(result.code).not.toContain('type="button"');
    });

    it('should add alt="" to images without alt', () => {
      const code = '<img src="logo.png" />';
      const result = cleanupTSX(code);
      
      expect(result.code).toContain('alt=""');
      expect(result.fixes).toContain('Added alt="" to 1 image(s)');
    });

    it('should not override existing alt attribute', () => {
      const code = '<img src="logo.png" alt="Company Logo" />';
      const result = cleanupTSX(code);
      
      expect(result.code).toContain('alt="Company Logo"');
      expect(result.fixes.length).toBe(0);
    });

    it('should add aria-label to icon-only buttons', () => {
      const code = '<button onClick={handleClick}><svg>...</svg></button>';
      const result = cleanupTSX(code);
      
      expect(result.code).toContain('aria-label="Icon button"');
      expect(result.fixes).toContain('Added aria-label to 1 icon-only button(s)');
    });

    it('should not add aria-label if already exists', () => {
      const code = '<button aria-label="Close" onClick={handleClick}><Icon /></button>';
      const result = cleanupTSX(code);
      
      expect(result.code).toContain('aria-label="Close"');
      expect(result.fixes.filter(f => f.includes('aria-label')).length).toBe(0);
    });

    it('should remove console statements by default', () => {
      const code = `
function MyComponent() {
  console.log('debug');
  console.error('error');
  return <div>Hello</div>;
}`;
      const result = cleanupTSX(code);
      
      expect(result.code).not.toContain('console.log');
      expect(result.code).not.toContain('console.error');
      expect(result.fixes).toContain('Removed 2 console statement(s)');
    });

    it('should not remove console statements when disabled', () => {
      const code = `console.log('debug');`;
      const result = cleanupTSX(code, { removeConsole: false });
      
      expect(result.code).toContain('console.log');
    });

    it('should remove empty className attributes', () => {
      const code = '<div className="">Content</div>';
      const result = cleanupTSX(code);
      
      expect(result.code).not.toContain('className=""');
      expect(result.fixes).toContain('Removed 1 empty className attribute(s)');
    });

    it('should normalize whitespace in className', () => {
      const code = '<div className="  class1   class2  ">Content</div>';
      const result = cleanupTSX(code);
      
      expect(result.code).toContain('className="class1 class2"');
    });

    it('should remove markdown code fences', () => {
      const code = '```tsx\nconst Component = () => <div>Hello</div>;\n```';
      const result = cleanupTSX(code);
      
      expect(result.code).not.toContain('```');
      expect(result.fixes.filter(f => f.includes('code fence')).length).toBeGreaterThan(0);
    });

    it('should NOT apply dangerous quote normalization', () => {
      const code = `<div className='my-class'>Content</div>`;
      const result = cleanupTSX(code);
      
      // Should NOT change single quotes to double quotes
      expect(result.code).toContain("className='my-class'");
    });
  });

  describe('cleanupTS', () => {
    it('should NOT remove console statements by default', () => {
      const code = `
function myFunction() {
  console.log('debug');
  return 42;
}`;
      const result = cleanupTS(code);
      
      expect(result.code).toContain('console.log');
    });

    it('should remove console statements when enabled', () => {
      const code = `
function myFunction() {
  console.log('debug');
  return 42;
}`;
      const result = cleanupTS(code, { removeConsole: true });
      
      expect(result.code).not.toContain('console.log');
      expect(result.fixes).toContain('Removed 1 console statement(s)');
    });

    it('should NOT apply JSX-specific cleanup', () => {
      const code = 'const x = 42;';
      const result = cleanupTS(code);
      
      // Should not have any JSX-related fixes
      expect(result.fixes.filter(f => f.includes('button')).length).toBe(0);
      expect(result.fixes.filter(f => f.includes('aria-label')).length).toBe(0);
    });

    it('should remove markdown code fences', () => {
      const code = '```ts\nconst x = 42;\n```';
      const result = cleanupTS(code);
      
      expect(result.code).not.toContain('```');
      expect(result.fixes.filter(f => f.includes('code fence')).length).toBeGreaterThan(0);
    });
  });

  describe('cleanupCSS', () => {
    it('should remove markdown code fences', () => {
      const code = '```css\n.class { color: red; }\n```';
      const result = cleanupCSS(code);
      
      expect(result.code).not.toContain('```');
      expect(result.code).toContain('.class { color: red; }');
    });

    it('should trim trailing whitespace', () => {
      const code = '.class { color: red; }  \n.other { }  ';
      const result = cleanupCSS(code);
      
      expect(result.code).not.toMatch(/\s+$/);
    });
  });

  describe('cleanupJSON', () => {
    it('should format valid JSON', () => {
      const code = '{"name":"test","value":42}';
      const result = cleanupJSON(code);
      
      expect(result.code).toContain('  '); // Should have indentation
      expect(result.fixes).toContain('Formatted JSON');
    });

    it('should leave invalid JSON unchanged', () => {
      const code = '{invalid json}';
      const result = cleanupJSON(code);
      
      expect(result.code).toBe('{invalid json}');
    });

    it('should remove markdown code fences', () => {
      const code = '```json\n{"name": "test"}\n```';
      const result = cleanupJSON(code);
      
      expect(result.code).not.toContain('```');
    });
  });

  describe('cleanupCode', () => {
    it('should route .tsx files to cleanupTSX', () => {
      const code = '<button>Click</button>';
      const result = cleanupCode(code, 'Component.tsx');
      
      expect(result.code).toContain('type="button"');
    });

    it('should route .jsx files to cleanupTSX', () => {
      const code = '<button>Click</button>';
      const result = cleanupCode(code, 'Component.jsx');
      
      expect(result.code).toContain('type="button"');
    });

    it('should route .ts files to cleanupTS', () => {
      const code = 'console.log("test");';
      const result = cleanupCode(code, 'utils.ts');
      
      // Should NOT remove console by default for .ts
      expect(result.code).toContain('console.log');
    });

    it('should route .js files to cleanupTS', () => {
      const code = 'console.log("test");';
      const result = cleanupCode(code, 'utils.js');
      
      // Should NOT remove console by default for .js
      expect(result.code).toContain('console.log');
    });

    it('should route .css files to cleanupCSS', () => {
      const code = '```css\n.class {}\n```';
      const result = cleanupCode(code, 'styles.css');
      
      expect(result.code).not.toContain('```');
    });

    it('should route .json files to cleanupJSON', () => {
      const code = '{"test":true}';
      const result = cleanupCode(code, 'package.json');
      
      expect(result.code).toContain('  '); // Should have indentation
    });

    it('should leave unknown file types unchanged', () => {
      const code = 'Some random content';
      const result = cleanupCode(code, 'README.md');
      
      expect(result.code).toBe(code);
      expect(result.fixes.length).toBe(0);
    });

    it('should pass options through to cleanup functions', () => {
      const code = 'console.log("test");';
      const result = cleanupCode(code, 'utils.ts', { removeConsole: true });
      
      // Should remove console when explicitly enabled
      expect(result.code).not.toContain('console.log');
    });
  });
});
