export interface TranscriptLineDto {
  sender: 'user' | 'bot';
  text: string;
}

export interface RecommendationDto {
  name: string;
  tags: string[];
}

export interface RankedMetaDto {
  name: string;
  score: number;
  matched: string[];
}

const MAX_TRANSCRIPT_MESSAGES = 24;

export function buildNarrationPack(
  transcript: readonly TranscriptLineDto[],
  recommendations: readonly RecommendationDto[],
  rankedMeta?: readonly RankedMetaDto[],
): { transcriptBlock: string; structuredBlock: string } {
  const slice = transcript.slice(-MAX_TRANSCRIPT_MESSAGES);
  const lines = slice.map((m) => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`);
  const structured = JSON.stringify({
    ranked:
      rankedMeta && rankedMeta.length > 0
        ? rankedMeta
        : recommendations.map((r) => ({ name: r.name, tags: r.tags })),
  });
  return {
    transcriptBlock: lines.join('\n'),
    structuredBlock: structured,
  };
}
