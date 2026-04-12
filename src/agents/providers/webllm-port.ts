/** Port for browser LLM completion — implemented by CDN WebLLM adapter or mocks in tests. */
export interface WebLlmCompletionPort {
  complete(system: string, user: string): Promise<string>;
}
