import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { concatMap, filter, from, pipe, tap } from 'rxjs';
import { TasteNarrationFacade } from '../../core-services/taste-narration.facade';
import { TasteRecommendationService } from '../../core-services/taste-recommendation.service';
import { ChatMessage } from '../../models/chat-types';

export type { ChatMessage } from '../../models/chat-types';

export interface ChatState {
  messages: ChatMessage[];
  userInput: string;
  isLoading: boolean;
}

const initialState: ChatState = {
  messages: [
    {
      id: '1',
      text: "Hello! I'm your liquor recommendation assistant. Tell me about your taste preferences, and I'll suggest some liquors you might enjoy.",
      sender: 'bot',
    },
  ],
  userInput: '',
  isLoading: false,
};

export const LiquorChatbotStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ messages }) => ({
    messageCount: computed(() => messages().length),
  })),
  withMethods((store, taste = inject(TasteRecommendationService), narration = inject(TasteNarrationFacade)) => {
    const updateUserInput = (input: string) => {
      patchState(store, { userInput: input });
    };

    const clearUserInput = () => {
      patchState(store, { userInput: '' });
    };

    const addUserMessage = (text: string) => {
      patchState(store, {
        messages: [
          ...store.messages(),
          {
            id: Date.now().toString(),
            text,
            sender: 'user',
          },
        ],
      });
    };

    const addBotMessage = (message: ChatMessage) => {
      patchState(store, {
        messages: [...store.messages(), message],
        isLoading: false,
      });
    };

    const setLoading = (isLoading: boolean) => {
      patchState(store, { isLoading });
    };

    const getConfidenceLabel = (confidence?: number): string => {
      if (!confidence) return 'Unknown';
      if (confidence > 0.8) return 'High';
      if (confidence > 0.5) return 'Medium';
      return 'Low';
    };

    const sendMessage = rxMethod<string>(
      pipe(
        filter((userInput) => userInput.trim().length > 0),
        tap((userInput) => {
          addUserMessage(userInput);
          clearUserInput();
          setLoading(true);
        }),
        concatMap((userInput) => {
          const userTurns = store.messages().filter((m) => m.sender === 'user').map((m) => m.text);
          return from(
            (async () => {
              const response = await taste.recommend(userInput, { userTurns });
              const transcript = store.messages();
              let responseText: string;
              try {
                responseText = await narration.runNarration({
                  baseResponse: response.response,
                  reasoning: response.reasoning,
                  recommendations: response.recommendations,
                  rankedMeta: response.rankedMeta,
                  transcript,
                });
              } catch (err) {
                const detail = err instanceof Error ? err.message : String(err);
                responseText = `Something went wrong generating the reply (${detail}). Your ranked list is still shown below.`;
              }
              if (response.recommendations.length === 0) {
                responseText +=
                  " I couldn't find any specific liquors matching your preferences. Could you tell me more about what you like?";
              }
              return { response, responseText };
            })(),
          );
        }),
        tap(({ response, responseText }) => {
          addBotMessage({
            id: Date.now().toString(),
            text: responseText || '',
            sender: 'bot',
            recommendations: response.recommendations,
            reasoning: response.reasoning,
            confidence: response.confidence,
          });
        }),
      ),
    );

    return {
      updateUserInput,
      clearUserInput,
      addUserMessage,
      addBotMessage,
      setLoading,
      getConfidenceLabel,
      sendMessage,
    };
  }),
);
