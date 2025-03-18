import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { delay, of, pipe, switchMap, tap } from 'rxjs';
import { LiquorRecommendationAgentChainService } from '../../core-services/liquor-recommendation-chain.service';
import { Liqour } from '../../models/recipe-book';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  recommendations?: Liqour[];
  reasoning?: string;
  confidence?: number;
}

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
  withMethods((store, agent = inject(LiquorRecommendationAgentChainService)) => {
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
        tap((userInput) => {
          if (!userInput.trim()) return;

          // Add user message and clear input
          addUserMessage(userInput);
          clearUserInput();
          setLoading(true);
        }),
        delay(500), // Simulate processing delay
        switchMap((userInput) => {
          if (!userInput.trim()) return of(null);

          // Process with agent
          return agent.getRecommendations(userInput);
        }),
        tap((response) => {
          console.log(response);
          let responseText = response?.response;
          if (response?.recommendations.length === 0) {
            responseText +=
              " I couldn't find any specific liquors matching your preferences. Could you tell me more about what you like?";
          }

          // Add bot response
          addBotMessage({
            id: Date.now().toString(),
            text: responseText || '',
            sender: 'bot',
            recommendations: response?.recommendations,
            reasoning: response?.reasoning,
            confidence: response?.confidence,
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
