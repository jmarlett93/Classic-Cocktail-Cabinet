import { Injectable } from '@angular/core';
import { BufferMemory } from 'langchain/memory';

import { StringOutputParser } from '@langchain/core/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { Liqour, liquors } from '../models/recipe-book';
import { FlavorProfileEmbeddings } from './embeddings/flavor-profile-embeddings';
import { findLiquorsByTags, getAllLiquorTypes, getAllTags } from './liquor-store';
export interface RecommendationResult {
  recommendations: Liqour[];
  reasoning: string;
  confidence: number;
  response: string;
}

@Injectable({
  providedIn: 'root',
})
export class LiquorRecommendationAgentChainService {
  private vectorStore: MemoryVectorStore;
  private memory: BufferMemory;
  private promptTemplate: PromptTemplate;
  private chain: RunnableSequence;

  constructor() {
    // Initialize in-memory vector store with custom embeddings
    // For a real implementation, you'd want to replace FakeEmbeddings with your own embedding function
    const embeddings = new FlavorProfileEmbeddings({});
    this.vectorStore = new MemoryVectorStore(embeddings);

    // Initialize conversation memory
    this.memory = new BufferMemory({
      memoryKey: 'chat_history',
      returnMessages: true,
    });

    // Create prompt template
    this.promptTemplate = PromptTemplate.fromTemplate(`
      Based on the following user request, identify:
      - Preferred liquor types
      - Flavor tags they might enjoy
      - Tags they want to avoid
      
      Previous conversation context: {chat_history}
      User request: {userInput}
      
      Respond with structured data only.
    `);

    // Create a custom chain that uses your own NLP logic instead of an LLM
    this.chain = RunnableSequence.from([
      {
        userInput: (input) => input.userInput,
        chat_history: async () => {
          const memoryResult = await this.memory.loadMemoryVariables({});
          return memoryResult['chat_history'] || '';
        },
      },
      this.promptTemplate,
      // Instead of an LLM, use your own custom processor
      (prompt) => this.customNlpProcessor(prompt),
      new StringOutputParser(),
    ]);

    // Populate vector store with liquor data for semantic search
    this.initializeVectorStore();
  }

  private initializeVectorStore(): void {
    // Add your liquor data to the vector store
    // This would involve creating embeddings for each liquor's description/tags
    // For demonstration purposes, we're using placeholder code
    const allLiquors = [...liquors];

    allLiquors.forEach((liquor) => {
      const document = {
        pageContent: `${liquor.name}: Tags: ${liquor.tags.join(', ')}`,
        metadata: { id: liquor.name, type: liquor.type, tags: liquor.tags },
      };

      this.vectorStore.addDocuments([document]);
    });
  }

  private customNlpProcessor(prompt: any): any {
    // This is where you'd implement your own NLP logic
    // Parse the prompt to extract user preferences
    console.log('customNlpProcessor', prompt);
    console.log('prompt type', typeof prompt);
    const promptText = typeof prompt === 'string' ? prompt : prompt.text || prompt.value || JSON.stringify(prompt);
    const preferredTypes = this.extractLiquorTypes(promptText);
    const preferredTags = this.extractPreferredTags(promptText);
    const avoidedTags = this.extractAvoidedTags(promptText);

    return JSON.stringify({
      preferredTypes,
      preferredTags,
      avoidedTags,
      reasoning: 'Based on keyword analysis of user input',
      confidence: this.calculateConfidence(preferredTypes, preferredTags),
    });
  }

  private extractLiquorTypes(text: string): string[] {
    // Simple keyword extraction for liquor types
    const types = getAllLiquorTypes();
    return types.filter((type) => text.toLowerCase().includes(type));
  }

  private extractPreferredTags(text: string): string[] {
    // Extract preferred flavor tags
    const flavorTags = getAllTags();
    return flavorTags.filter((tag) => {
      // Look for positive associations
      return (
        text.toLowerCase().includes(`like ${tag}`) ||
        text.toLowerCase().includes(`enjoy ${tag}`) ||
        text.toLowerCase().includes(`prefer ${tag}`)
      );
    });
  }

  private extractAvoidedTags(text: string): string[] {
    // Extract avoided flavor tags
    const flavorTags = getAllTags();
    return flavorTags.filter((tag) => {
      // Look for negative associations
      return (
        text.toLowerCase().includes(`don't like ${tag}`) ||
        text.toLowerCase().includes(`dislike ${tag}`) ||
        text.toLowerCase().includes(`avoid ${tag}`)
      );
    });
  }

  private calculateConfidence(types: string[], tags: string[]): number {
    // Simple confidence calculation based on how many preferences were identified
    const totalIdentified = types.length + tags.length;
    return Math.min(0.3 + totalIdentified * 0.15, 0.95);
  }

  public async getRecommendations(userInput: string): Promise<RecommendationResult> {
    console.log('getRecommendations', userInput);

    // Process with our custom chain
    const result = await this.chain.invoke({ userInput });
    const nlpResult = JSON.parse(result);

    // Save to memory for context in future interactions
    await this.memory.saveContext({ input: userInput }, { output: JSON.stringify(nlpResult) });

    // Get recommendations based on semantic search if available
    let recommendations: Liqour[] = [];
    console.log('nlpResult', nlpResult.preferredTags);
    if (nlpResult.preferredTags.length > 0) {
      // Try semantic search first
      const searchQuery = nlpResult.preferredTags.join(' ');
      const vectorResults = await this.vectorStore.similaritySearch(searchQuery, 5);

      if (vectorResults.length > 0) {
        console.log('vectorResults', vectorResults);
        // Extract liquor IDs from search results
        const liquorIds = vectorResults.map((doc) => doc.metadata['id']);
        // Fetch full liquor objects (implementation depends on your data structure)
        recommendations = this.getLiquorsByIds(liquorIds);
      } else {
        console.log('no vector results', nlpResult.preferredTags);
        // Fall back to tag-based search
        recommendations = findLiquorsByTags(nlpResult.preferredTags);
      }
    }

    // Apply additional filtering logic from your original implementation
    // ... existing code for filtering by type, avoiding tags, etc. ...

    return {
      recommendations,
      reasoning: nlpResult.reasoning,
      confidence: nlpResult.confidence,
      response: this.formatResponse(nlpResult),
    };
  }

  private getLiquorsByIds(ids: string[]): Liqour[] {
    // Implementation depends on how your liquor data is stored
    // This is a placeholder
    return liquors.filter((liquor) => ids.includes(liquor.name));
  }

  private formatResponse(nlpResult: any): string {
    // Format a natural language response based on the NLP results
    if (nlpResult.preferredTypes.length > 0 && nlpResult.preferredTags.length > 0) {
      return `I've found some ${nlpResult.preferredTypes.join('/')} options with ${nlpResult.preferredTags.join(', ')} characteristics that you might enjoy.`;
    } else if (nlpResult.preferredTags.length > 0) {
      return `Based on your preference for ${nlpResult.preferredTags.join(', ')} flavors, here are some recommendations.`;
    } else if (nlpResult.preferredTypes.length > 0) {
      return `Here are some quality ${nlpResult.preferredTypes.join('/')} options you might enjoy.`;
    } else {
      return `Here are some popular options that many people enjoy.`;
    }
  }
}
