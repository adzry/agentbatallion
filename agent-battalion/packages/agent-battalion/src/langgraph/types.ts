export type AgentContext = {
  spec: string;
  appName: string;
};

export type AgentResult = {
  ok: boolean;
  output?: unknown;
};
