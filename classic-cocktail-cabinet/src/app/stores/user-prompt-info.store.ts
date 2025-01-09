import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
export interface UserPromptInfoState {
  prompt: string;
  preferences: string[];
}

const initialState: UserPromptInfoState = {
  prompt: '',
  preferences: [],
};

export const UserPromptInfoStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    updatePrompt(prompt: string) {
      patchState(store, { prompt });
    },
    updatePreferences(preferences: string[]) {
      patchState(store, { preferences });
    },
  })),
);
