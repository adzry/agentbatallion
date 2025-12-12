import type { MissionSpec, MissionResult } from "../types";

/**
 * Placeholder activity that will later invoke LangGraph agents.
 */
export async function runLangGraphMission(_spec: MissionSpec): Promise<MissionResult> {
  throw new Error("runLangGraphMission not implemented (Phase 1)");
}
