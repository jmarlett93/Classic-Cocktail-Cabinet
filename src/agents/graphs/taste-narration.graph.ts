/** Browser-safe LangGraph entry (no `node:async_hooks`); use this from Angular / esbuild. */
import { Annotation, END, START, StateGraph } from '@langchain/langgraph/web';
import { validateReplyAgainstCatalog } from '../lib/catalog-guard';
import { buildNarrationPack, type RankedMetaDto, type RecommendationDto, type TranscriptLineDto } from '../lib/narration-pack';
import type { WebLlmCompletionPort } from '../providers/webllm-port';

export interface TasteNarrationDeps {
  fullCatalogNames: readonly string[];
  webLlm: WebLlmCompletionPort;
}

export interface TasteNarrationInput {
  baseResponse: string;
  reasoning: string;
  allowedNames: readonly string[];
  transcript: readonly TranscriptLineDto[];
  recommendations: readonly RecommendationDto[];
  rankedMeta?: readonly RankedMetaDto[];
}

const TasteNarrationAnnotation = Annotation.Root({
  baseResponse: Annotation<string>(),
  reasoning: Annotation<string>(),
  allowedNames: Annotation<string[]>(),
  transcript: Annotation<TranscriptLineDto[]>(),
  recommendations: Annotation<RecommendationDto[]>(),
  rankedMeta: Annotation<RankedMetaDto[] | undefined>(),
  structuredBlock: Annotation<string | undefined>(),
  transcriptBlock: Annotation<string | undefined>(),
  candidateText: Annotation<string | undefined>(),
  displayText: Annotation<string | undefined>(),
});

function buildPackNode(state: typeof TasteNarrationAnnotation.State): {
  structuredBlock: string;
  transcriptBlock: string;
} {
  const { transcriptBlock, structuredBlock } = buildNarrationPack(
    state.transcript,
    state.recommendations,
    state.rankedMeta,
  );
  return { structuredBlock, transcriptBlock };
}

const NARRATION_LOG = '[taste-narration]';

function createNarrateNode(deps: TasteNarrationDeps) {
  return async (state: typeof TasteNarrationAnnotation.State): Promise<{ candidateText: string }> => {
    const system = [
      'You are a concise spirits tasting-room guide.',
      'Use only bottle names listed in the JSON "ranked" array. Do not invent bottles.',
      'Under ~120 words. Friendly, second person.',
    ].join(' ');

    const user = [
      `Structured ranking (ground truth): ${state.structuredBlock ?? ''}`,
      `Assistant draft (from ranking): ${state.baseResponse}`,
      `Reasoning notes: ${state.reasoning}`,
      `Recent conversation:\n${state.transcriptBlock ?? ''}`,
      'Write one short reply that incorporates the ranking and conversation naturally.',
    ].join('\n\n');

    console.log(`${NARRATION_LOG} WebLLM: begin complete()`);
    const raw = await deps.webLlm.complete(system, user);
    const trimmed = typeof raw === 'string' ? raw.trim() : '';
    if (!trimmed) {
      throw new Error('WebLLM returned an empty reply');
    }
    console.log(`${NARRATION_LOG} WebLLM: complete ok`, { responseChars: trimmed.length });
    return { candidateText: trimmed };
  };
}

function createValidateNode(deps: TasteNarrationDeps) {
  return (state: typeof TasteNarrationAnnotation.State): { displayText: string } => {
    const candidate = state.candidateText ?? '';
    const allowed = new Set(state.allowedNames);
    const v = validateReplyAgainstCatalog(candidate, allowed, deps.fullCatalogNames);
    if (!v.ok) {
      throw new Error('Model mentioned a bottle outside this recommendation; refusing to show that reply.');
    }
    const t = v.text.trim();
    if (!t) {
      throw new Error('Validated narration text was empty');
    }
    return { displayText: t };
  };
}

export function compileTasteNarrationGraph(deps: TasteNarrationDeps) {
  return new StateGraph(TasteNarrationAnnotation)
    .addNode('buildPack', buildPackNode)
    .addNode('narrate', createNarrateNode(deps))
    .addNode('validate', createValidateNode(deps))
    .addEdge(START, 'buildPack')
    .addEdge('buildPack', 'narrate')
    .addEdge('narrate', 'validate')
    .addEdge('validate', END)
    .compile();
}

export async function runTasteNarrationGraph(
  input: TasteNarrationInput,
  deps: TasteNarrationDeps,
): Promise<{ displayText: string }> {
  const app = compileTasteNarrationGraph(deps);
  const initial: typeof TasteNarrationAnnotation.State = {
    baseResponse: input.baseResponse,
    reasoning: input.reasoning,
    allowedNames: [...input.allowedNames],
    transcript: [...input.transcript],
    recommendations: [...input.recommendations],
    rankedMeta: input.rankedMeta ? [...input.rankedMeta] : undefined,
    structuredBlock: undefined,
    transcriptBlock: undefined,
    candidateText: undefined,
    displayText: undefined,
  };
  const out = await app.invoke(initial);
  const displayText = out.displayText?.trim();
  if (!displayText) {
    throw new Error('Narration graph finished without display text');
  }
  return { displayText };
}
