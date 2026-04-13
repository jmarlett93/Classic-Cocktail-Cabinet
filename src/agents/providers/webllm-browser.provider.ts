import type { WebLlmCompletionPort } from './webllm-port';

/** Prebuilt MLC chat model (quality / speed balance for this app). */
const DEFAULT_MODEL_ID = 'Llama-3.2-1B-Instruct-q4f16_1-MLC';
const LOG = '[taste-narration] WebLLM';

/** Tight cap: narration is a short paragraph; lowers worst-case decode time. */
const NARRATION_MAX_TOKENS = 112;
/** Slightly greedy sampling — often a bit faster than mid-range temps on GPU backends. */
const NARRATION_TEMPERATURE = 0.2;
const NARRATION_TOP_P = 0.82;
const NARRATION_REPETITION_PENALTY = 1.08;

type WebLlmEngine = {
  chat: {
    completions: {
      create: (req: {
        messages: { role: string; content: string }[];
        max_tokens?: number | null;
        temperature?: number | null;
        top_p?: number | null;
        repetition_penalty?: number | null;
      }) => Promise<{
        choices: { message?: { content?: string | null } }[];
        usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
      }>;
    };
  };
};

type CreateMLCEngineFn = (
  modelId: string,
  engineConfig?: { initProgressCallback?: (p: unknown) => void },
  chatOpts?: { context_window_size?: number },
) => Promise<WebLlmEngine>;

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
        /** Smaller KV than 4k default — enough for our short system + user pack + transcript slice. */
        const engine = await (CreateMLCEngine as CreateMLCEngineFn)(
          DEFAULT_MODEL_ID,
          { initProgressCallback: () => undefined },
          { context_window_size: 2048 },
        );
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
      repetition_penalty: NARRATION_REPETITION_PENALTY,
    });
    const inferenceMs = Math.round(performance.now() - tInfer);
    const totalMs = Math.round(performance.now() - t0);

    const u = completion.usage;
    const completionTok = u?.completion_tokens;
    const msPerTok =
      completionTok && completionTok > 0 ? Math.round(inferenceMs / completionTok) : undefined;

    const dominant = afterEngineMs >= inferenceMs ? 'engine_load (weights/WASM/GPU init)' : 'token_generation';
    console.log(`${LOG} completion timing`, {
      engineWaitMs: afterEngineMs,
      inferenceMs,
      totalMs,
      dominant,
      maxTokens: NARRATION_MAX_TOKENS,
      modelId: DEFAULT_MODEL_ID,
      usage: u,
      approxMsPerCompletionToken: msPerTok,
    });

    const choice = completion.choices[0]?.message?.content;
    return typeof choice === 'string' ? choice : '';
  }
}
