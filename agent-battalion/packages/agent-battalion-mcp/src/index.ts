/**
 * Placeholder MCP server entry.
 * Later phases: expose tools/resources for Agent Battalion via MCP.
 */

export function main() {
  // eslint-disable-next-line no-console
  console.log("@meta/agent-battalion-mcp (stub)");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
