import type { WebLlmCompletionPort } from './webllm-port';

/** Prebuilt MLC chat model (quality / speed balance for this app). */
const DEFAULT_MODEL_ID = 'Llama-3.2-1B-Instruct-q4f16_1-MLC';
const LOG = '[taste-narration] WebLLM';

const NARRATION_MAX_TOKENS = 160;
const NARRATION_TEMPERATURE = 0.35;
const NARRATION_TOP_P = 0.88;

type WebLlmEngine = {
  chat: {
    completions: {
      create: (req: {
        messages: { role: string; content: string }[];
        max_tokens?: number | null;
        temperature?: number | null;
        top_p?: number | null;
      }) => Promise<{
        choices: { message?: { content?: string | null } }[];
      }>;
    };
  };
};

type CreateMLCEngineFn = (modelId: string, opts?: { initProgressCallback?: (p: unknown) => void }) => Promise<WebLlmEngine>;

/**
 * Official npm package, lazy-loaded when the user enables browser narration.
 * Tuned for short replies; logs wall-clock for engine wait vs inference.
 */
export class WebLlmBrowserProvider implements WebLlmCompletionPort {
  private engine: WebLlmEngine | null = null;
  private load: Promise<WebLlmEngine> | null = null;

  /** Fire-and-forget: loads WASM + model so the first `complete()` is mostly inference only. */
  preload(): void {
    void this.ensureEngine();
  }

  private async ensureEngine(): Promise<WebLlmEngine> {
    if (this.engine) {
      return this.engine;
    }
    if (!this.load) {
      const loadStarted = performance.now();
      this.load = (async () => {
        const { CreateMLCEngine } = await import('@mlc-ai/web-llm');
        const engine = await (CreateMLCEngine as CreateMLCEngineFn)(DEFAULT_MODEL_ID, {
          initProgressCallback: () => undefined,
        });
        console.log(`${LOG} engine ready (first load)`, {
          loadMs: Math.round(performance.now() - loadStarted),
          modelId: DEFAULT_MODEL_ID,
        });
        return engine;
      })();
    }
    this.engine = await this.load;
    return this.engine;
  }

  async complete(system: string, user: string): Promise<string> {
    const t0 = performance.now();
    const engine = await this.ensureEngine();
    const afterEngineMs = Math.round(performance.now() - t0);

    const tInfer = performance.now();
    const completion = await engine.chat.completions.create({
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      max_tokens: NARRATION_MAX_TOKENS,
      temperature: NARRATION_TEMPERATURE,
      top_p: NARRATION_TOP_P,
    });
    const inferenceMs = Math.round(performance.now() - tInfer);
    const totalMs = Math.round(performance.now() - t0);

    const dominant = afterEngineMs >= inferenceMs ? 'engine_load (weights/WASM/GPU init)' : 'token_generation';
    console.log(`${LOG} completion timing`, {
      engineWaitMs: afterEngineMs,
      inferenceMs,
      totalMs,
      dominant,
      maxTokens: NARRATION_MAX_TOKENS,
      modelId: DEFAULT_MODEL_ID,
    });

    const choice = completion.choices[0]?.message?.content;
    return typeof choice === 'string' ? choice : '';
  }
}
