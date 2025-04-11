import { Injectable } from '@angular/core';
import { BufferMemory } from 'langchain/memory';

import { StringOutputParser } from '@langchain/core/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { Liqour, liquors } from '../models/recipe-book';
import { CustomNlpProcessor } from './custom-nlp-processor';
import { FlavorProfileEmbeddings } from './embeddings/flavor-profile-embeddings';

export interface RecommendationResult {
  recommendations: Liqour[];
  reasoning: string;
  confidence: number;
  response: string;
}

interface VectorResult {
  document: Document;
  score: number;
  id: string;
  type: string;
  tags: string[];
}

@Injectable({
  providedIn: 'root',
})
export class LiquorRecommendationAgentChainService {
  private vectorStore: MemoryVectorStore;
  private memory: BufferMemory;
  private promptTemplate: PromptTemplate;
  private chain: RunnableSequence;
  private nlpProcessor: CustomNlpProcessor;

  constructor() {
    // Initialize the NLP processor
    this.nlpProcessor = new CustomNlpProcessor();

    // Initialize in-memory vector store with custom embeddings
    const embeddings = new FlavorProfileEmbeddings();
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
    // architecture of the chain:
    // 1. userInput:self explanatory.
    // 2. chat_history: not implemented but should be used for context to engine.
    // 3. promptTemplate: this is the prompt that will be used to generate the response, currently it is only used for tags.
    // 4. processWithAdvancedNlp: Deterministic: this is the function that will be used to process the input with the advanced NLP processor.
    // The primary event loop of the chain is provideRecommendations which invokes the chain and returns a response.
    this.chain = RunnableSequence.from([
      {
        userInput: (input) => input.userInput,
        chat_history: async () => {
          const memoryResult = await this.memory.loadMemoryVariables({});
          return memoryResult['chat_history'] || '';
        },
      },
      // First, perform vector similarity search
      async (input) => {
        const vectorResultsWithScores = await this.vectorStore.similaritySearchWithScore(input.userInput, 8);
        console.log(vectorResultsWithScores);

        const mappedResults = vectorResultsWithScores.map(([doc, score]) => ({
          id: doc.metadata['id'],
          score: Math.round(score * 100) / 100,
          metadata: doc.metadata,
          content: doc.pageContent,
        }));
        console.log(mappedResults);
        return {
          ...input,
          vectorResults: mappedResults,
        };
      },
      // Then process with prompt template
      async (input) => {
        const promptResult = await this.promptTemplate.format(input);
        return {
          ...input,
          promptResult,
        };
      },
      // Extract text from prompt output and process with NLP
      async (input) => {
        const nlpResult = this.nlpProcessor.processInput(input.promptResult);

        // Get recommendations with scores
        const recommendations = this.getLiquorsByIds(input.vectorResults.map((result: VectorResult) => result.id)).map(
          (liquor, index) => {
            console.log(liquor);
            return {
              ...liquor,
              matchScore: input.vectorResults[index].score,
            };
          },
        );

        return JSON.stringify({
          recommendations,
          vectorScores: recommendations,
          intent: nlpResult.intent,
          detectedPreferences: nlpResult.detectedPreferences,
          reasoning: nlpResult.reasoning,
          confidence: nlpResult.confidence,
          response: nlpResult.response,
        });
      },
      new StringOutputParser(),
    ]);

    // Populate vector store with liquor data for semantic search
    this.initializeVectorStore();
  }

  private initializeVectorStore(): void {
    const allLiquors = [...liquors];
    allLiquors.forEach((liquor) => {
      const document = {
        pageContent: `${liquor.name}: Tags: ${liquor.tags.join(', ')}`,
        metadata: { id: liquor.name, type: liquor.type, tags: liquor.tags },
      };
      this.vectorStore.addDocuments([document]);
    });
  }

  public async getRecommendations(userInput: string): Promise<RecommendationResult> {
    const result = await this.chain.invoke({ userInput });
    const chainResult = JSON.parse(result);

    // Save context to memory
    await this.memory.saveContext({ input: userInput }, { output: result });

    return {
      recommendations: chainResult.recommendations,
      reasoning: chainResult.reasoning,
      confidence: chainResult.confidence,
      response: chainResult.response,
    };
  }

  private getLiquorsByIds(ids: string[]): Liqour[] {
    return liquors.filter((liquor) => ids.includes(liquor.name));
  }
}
