import { runTasteNarrationGraph } from './taste-narration.graph';
import type { WebLlmCompletionPort } from '../providers/webllm-port';

describe('runTasteNarrationGraph', () => {
  const fullCatalog = ['Gin', 'Campari'];

  it('returns WebLLM text when model output passes catalog guard', async () => {
    const webLlm: WebLlmCompletionPort = {
      async complete() {
        return 'Here is Gin — a lovely dry pick from your list.';
      },
    };
    const { displayText } = await runTasteNarrationGraph(
      {
        baseResponse: 'draft',
        reasoning: 'tags',
        allowedNames: ['Gin'],
        transcript: [{ sender: 'user', text: 'dry' }],
        recommendations: [{ name: 'Gin', tags: ['dry'] }],
      },
      { fullCatalogNames: fullCatalog, webLlm },
    );
    expect(displayText).toContain('Gin');
  });

  it('throws when WebLLM returns empty string', async () => {
    const webLlm: WebLlmCompletionPort = {
      async complete() {
        return '   ';
      },
    };
    let err: unknown;
    try {
      await runTasteNarrationGraph(
        {
          baseResponse: 'draft',
          reasoning: 'r',
          allowedNames: ['Gin'],
          transcript: [],
          recommendations: [{ name: 'Gin', tags: [] }],
        },
        { fullCatalogNames: fullCatalog, webLlm },
      );
    } catch (e) {
      err = e;
    }
    expect(err).toBeTruthy();
    expect(err instanceof Error ? err.message : '').toMatch(/empty reply/i);
  });
});
