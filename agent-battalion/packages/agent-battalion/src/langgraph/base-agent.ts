import type { AgentContext, AgentResult } from "./types";

export abstract class BaseAgent {
  abstract readonly name: string;

  async run(_ctx: AgentContext): Promise<AgentResult> {
    throw new Error(`${this.name}: not implemented (Phase 1)`);
  }
}
