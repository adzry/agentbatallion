/**
 * Phase 1: web server calls a direct mock generator.
 * Later: this will orchestrate LangGraph agents and/or Temporal workflows.
 */
export function createOrchestrator() {
  return {
    async generate() {
      throw new Error("Orchestrator not implemented (Phase 1)");
    }
  };
}
