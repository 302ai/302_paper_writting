import { StateCreator } from 'zustand';
import { devtools, persist, PersistOptions } from 'zustand/middleware';

const createJSONStorage = (): PersistOptions<unknown, unknown>['storage'] => ({
  getItem: (name: string) => {
    const str = sessionStorage.getItem(name);

    return str ? JSON.parse(str) : null;
  },
  setItem: (name: string, value: unknown) => {
    sessionStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name: string) => {
    sessionStorage.removeItem(name);
  },
});

export const storeMiddleware = <T>(
  f: StateCreator<T, [], [['zustand/devtools', T], ['zustand/persist', T]]>,
  name: string
) =>
  devtools(
    persist(f, {
      name,
      storage: createJSONStorage(),
    }),

    { enabled: false }
  );
