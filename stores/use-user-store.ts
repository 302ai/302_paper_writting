import { produce } from 'immer';
import { create } from 'zustand';

import { storeMiddleware } from './middleware';

interface UserState {
  language?: string;
}

interface UserActions {
  updateLanguage: (language: string) => void;
  updateAll: (
    apiKey?: string,
    modelName?: string,
    region?: string,
    code?: string,
    language?: string
  ) => void;
}

type UserStore = UserState & UserActions;

export const useUserStore = create<UserStore>()(
  storeMiddleware<UserStore>(
    (set) => ({
      language: 'zh',
      updateLanguage: (language) =>
        set(
          produce((state) => {
            state.language = language;
          })
        ),
      updateAll: (apiKey, modelName, region, code, language) =>
        set(
          produce((state) => {
            if (language) {
              state.language = language;
            }
          })
        ),
    }),
    'user-store'
  )
);
