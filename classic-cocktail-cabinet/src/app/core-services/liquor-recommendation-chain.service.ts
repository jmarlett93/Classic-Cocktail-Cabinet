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
      this.promptTemplate,
      // Extract text from prompt output
      (promptOutput) => {
        if (typeof promptOutput === 'string') return promptOutput;
        return promptOutput.text || promptOutput.value || JSON.stringify(promptOutput);
      },
      // Use the advanced NLP processor instead of the simple one
      (promptText) => this.processWithAdvancedNlp(promptText),
      new StringOutputParser(),
    ]);

    // Populate vector store with liquor data for semantic search
    this.initializeVectorStore();
  }

  private initializeVectorStore(): void {
    // Add your liquor data to the vector store
    const allLiquors = [...liquors];
    // vector store is deterministic for now.
    allLiquors.forEach((liquor) => {
      const document = {
        pageContent: `${liquor.name}: Tags: ${liquor.tags.join(', ')}`,
        metadata: { id: liquor.name, type: liquor.type, tags: liquor.tags },
      };

      this.vectorStore.addDocuments([document]);
    });
  }

  private processWithAdvancedNlp(promptText: string): string {
    console.log('Processing with advanced NLP:', promptText);

    // Use the CustomNlpProcessor to process the input
    //TODO: enhance this to parse and statements and correctly add negations.
    // Also ensure it handles extra tags and types including fuzzy matches.
    const nlpResult = this.nlpProcessor.processInput(promptText);

    // Convert the result to a string for the LangChain pipeline
    return JSON.stringify({
      preferredTypes: nlpResult.liquorTypes,
      preferredTags: nlpResult.keywords,
      avoidedTags: nlpResult.negativeKeywords,
      reasoning: nlpResult.reasoning,
      confidence: nlpResult.confidence,
      responseTemplate: nlpResult.responseTemplate,
    });
  }
  public async getRecommendations(userInput: string): Promise<RecommendationResult> {
    // Step 1: Extract structured preferences with NLP
    const result = await this.chain.invoke({ userInput });
    const nlpResult = JSON.parse(result);

    // Save to memory
    await this.memory.saveContext({ input: userInput }, { output: JSON.stringify(nlpResult) });

    // Step 2: Determine search strategy
    let recommendations: Liqour[] = [];

    // If user specified a liquor type, use that as a primary filter
    if (nlpResult.preferredTypes && nlpResult.preferredTypes.length > 0) {
      // Get all liquors of the specified type(s)
      const typeFilteredLiquors = liquors.filter((liquor) => nlpResult.preferredTypes.includes(liquor.type));

      // If we have type-filtered liquors, do semantic search within that subset
      if (typeFilteredLiquors.length > 0) {
        // Create a temporary vector store with just these liquors
        const tempEmbeddings = new FlavorProfileEmbeddings();
        const tempVectorStore = new MemoryVectorStore(tempEmbeddings);

        // Add type-filtered liquors to temp store
        await Promise.all(
          typeFilteredLiquors.map((liquor) => {
            return tempVectorStore.addDocuments([
              {
                pageContent: `${liquor.name}: Tags: ${liquor.tags.join(', ')}`,
                metadata: { id: liquor.name, type: liquor.type, tags: liquor.tags },
              },
            ]);
          }),
        );

        // Do semantic search within this filtered set
        const vectorResults = await tempVectorStore.similaritySearch(userInput, 15);
        if (vectorResults.length > 0) {
          const liquorIds = vectorResults.map((doc) => doc.metadata['id']);
          recommendations = this.getLiquorsByIds(liquorIds);
        }
      }
    }
    // If no type specified, do semantic search across all liquors
    else {
      const vectorResults = await this.vectorStore.similaritySearch(userInput, 15);
      if (vectorResults.length > 0) {
        const liquorIds = vectorResults.map((doc) => doc.metadata['id']);
        recommendations = this.getLiquorsByIds(liquorIds);
      }
    }

    // Step 3: Apply avoided tags filtering (this is still necessary)
    if (nlpResult.avoidedTags && nlpResult.avoidedTags.length > 0) {
      recommendations = recommendations.filter(
        (liquor) => !liquor.tags.some((tag) => nlpResult.avoidedTags.includes(tag)),
      );
    }

    // Fallbacks if needed
    if (recommendations.length === 0) {
      // Your existing fallback logic
    }

    return {
      recommendations,
      reasoning: nlpResult.reasoning,
      confidence: nlpResult.confidence,
      response: this.nlpProcessor.formatResponse(nlpResult),
    };
  }

  // public async getRecommendations(userInput: string): Promise<RecommendationResult> {
  //   console.log('getRecommendations', userInput);

  //   // Process with our custom chain
  //   const result = await this.chain.invoke({ userInput });
  //   const nlpResult = JSON.parse(result);

  //   // Save to memory for context in future interactions
  //   await this.memory.saveContext({ input: userInput }, { output: JSON.stringify(nlpResult) });

  //   // Get recommendations based on semantic search if available
  //   let recommendations: Liqour[] = [];
  //   console.log('nlpResult', nlpResult);
  //   if (nlpResult.preferredTags.length > 0) {
  //     // Try semantic search first
  //     const searchQuery = nlpResult.preferredTags.join(' ');
  //     const vectorResults = await this.vectorStore.similaritySearch(searchQuery, 10);

  //     if (vectorResults.length > 0) {
  //       console.log('vectorResults', vectorResults);
  //       // Extract liquor IDs from search results
  //       const liquorIds = vectorResults.map((doc) => doc.metadata['id']);
  //       // Fetch full liquor objects (implementation depends on your data structure)
  //       recommendations = this.getLiquorsByIds(liquorIds);
  //     } else {
  //       console.log('no vector results', nlpResult.preferredTags);
  //       // Fall back to tag-based search
  //       recommendations = findLiquorsByTags(nlpResult.preferredTags);
  //     }
  //   }

  //   // Apply additional filtering logic
  //   // Filter by type if specified
  //   if (nlpResult.preferredTypes && nlpResult.preferredTypes.length > 0) {
  //     recommendations = recommendations.filter((liquor) => nlpResult.preferredTypes.includes(liquor.type));
  //   }

  //   // Remove items with avoided tags
  //   if (nlpResult.avoidedTags && nlpResult.avoidedTags.length > 0) {
  //     recommendations = recommendations.filter(
  //       (liquor) => !liquor.tags.some((tag) => nlpResult.avoidedTags.includes(tag)),
  //     );
  //   }

  //   // If no recommendations, try using common tags
  //   if (recommendations.length === 0) {
  //     const commonTags = ['sweet', 'smooth', 'warm'];
  //     recommendations = findLiquorsByTags(commonTags);
  //   }

  //   // Limit to top 5 recommendations
  //   recommendations = recommendations.slice(0, 10);

  //   return {
  //     recommendations,
  //     reasoning: nlpResult.reasoning,
  //     confidence: nlpResult.confidence,
  //     response: this.nlpProcessor.formatResponse(nlpResult),
  //   };
  // }

  private getLiquorsByIds(ids: string[]): Liqour[] {
    console.log('getLiquorsByIds', ids);
    return liquors.filter((liquor) => ids.includes(liquor.name));
  }
}
