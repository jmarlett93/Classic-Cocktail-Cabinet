import { Injectable } from '@angular/core';
import { runTasteNarrationGraph, type TasteNarrationInput } from '../../agents/graphs/taste-narration.graph';
import { WebLlmBrowserProvider } from '../../agents/providers/webllm-browser.provider';
import type { RankedMetaDto, RecommendationDto, TranscriptLineDto } from '../../agents/lib/narration-pack';
import { liquors } from '../models/recipe-book';
import type { ChatMessage } from '../models/chat-types';
import type { Liqour } from '../models/recipe-book';

/**
 * Angular boundary into LangGraph narration — no graph logic here, only DTO mapping.
 */
@Injectable({ providedIn: 'root' })
export class TasteNarrationFacade {
  private readonly fullCatalogNames = liquors.map((l) => l.name);
  private sharedBrowserLlm: WebLlmBrowserProvider | null = null;

  /** Warm WebGPU + model download before the first user message. */
  preloadBrowserLlm(): void {
    if (!this.sharedBrowserLlm) {
      this.sharedBrowserLlm = new WebLlmBrowserProvider();
    }
    this.sharedBrowserLlm.preload();
  }

  private webLlm(): WebLlmBrowserProvider {
    if (!this.sharedBrowserLlm) {
      this.sharedBrowserLlm = new WebLlmBrowserProvider();
    }
    return this.sharedBrowserLlm;
  }

  async runNarration(params: {
    baseResponse: string;
    reasoning: string;
    recommendations: Liqour[];
    rankedMeta?: { name: string; score: number; matched: string[] }[];
    transcript: ChatMessage[];
  }): Promise<string> {
    const transcript: TranscriptLineDto[] = params.transcript.map((m) => ({
      sender: m.sender,
      text: m.text,
    }));
    const recommendations: RecommendationDto[] = params.recommendations.map((r) => ({
      name: r.name,
      tags: r.tags,
    }));
    const rankedMeta: RankedMetaDto[] | undefined = params.rankedMeta?.map((r) => ({
      name: r.name,
      score: r.score,
      matched: r.matched,
    }));

    const input: TasteNarrationInput = {
      baseResponse: params.baseResponse,
      reasoning: params.reasoning,
      allowedNames: params.recommendations.map((r) => r.name),
      transcript,
      recommendations,
      rankedMeta,
    };

    const { displayText } = await runTasteNarrationGraph(input, {
      fullCatalogNames: this.fullCatalogNames,
      webLlm: this.webLlm(),
    });
    return displayText;
  }
}
