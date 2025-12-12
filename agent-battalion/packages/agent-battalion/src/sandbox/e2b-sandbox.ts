export type SandboxRunResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
};

/**
 * Placeholder for E2B sandbox integration.
 */
export class E2BSandbox {
  async run(_cmd: string, _opts?: { cwd?: string; timeoutMs?: number }): Promise<SandboxRunResult> {
    return { stdout: "", stderr: "E2B sandbox not implemented (Phase 1)", exitCode: 1 };
  }
}
