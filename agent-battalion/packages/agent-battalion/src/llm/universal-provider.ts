export type UniversalChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type UniversalProviderConfig = {
  provider: "mock" | "openai" | "anthropic" | string;
  model?: string;
  apiKey?: string;
};

/**
 * Phase 1: placeholder. Later this will route to OpenAI/Anthropic/etc.
 */
export class UniversalLLMProvider {
  constructor(private readonly config: UniversalProviderConfig) {}

  async chat(_messages: UniversalChatMessage[]): Promise<string> {
    if (this.config.provider !== "mock") {
      throw new Error("UniversalLLMProvider: only mock provider is implemented in Phase 1");
    }
    return "(mock)";
  }
}
