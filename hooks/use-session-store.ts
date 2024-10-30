import { create } from 'zustand';
import { produce } from 'immer';
import Dexie, { Table } from 'dexie';
import { useCallback, useState } from 'react';

import { storeMiddleware } from '@/stores/middleware';
import { Session } from '@/types';

class SessionDatabase extends Dexie {
  sessions!: Table<SessionState>;

  constructor() {
    super('SessionDB');
    this.version(2).stores({
      sessions: '++id, title, createdAt, updatedAt',
    });
  }
}

const db = new SessionDatabase();

export interface SessionState extends Session {}

interface SessionActions {
  updateCurrentSession: (updates: Partial<SessionState>) => void;
  setCurrentSession: (session: SessionState | null) => void;
  saveSession: () => Promise<string>;
}

export const useSessionStore = create<SessionState & SessionActions>()(
  storeMiddleware(
    (set) => ({
      id: '',
      title: '',
      taskId: '',
      summary: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      query: '',
      outline: '',
      article: '',
      urlToInfo: [],
      searchResults: { conversations: [], url_to_info: {} },
      middleInfo: '',
      updateCurrentSession: (updates) =>
        set(
          produce((state: SessionState) => {
            Object.assign(state, updates);
            state.updatedAt = Date.now();
          })
        ),
      setCurrentSession: (session) => set(session ? { ...session } : {}),
      saveSession: async () => {
        try {
          const currentState = useSessionStore.getState();

          console.log(
            'currentState when saving session to history is ',
            currentState
          );

          const cloneableSession = Object.keys(currentState).reduce(
            (acc, key) => {
              const value = currentState[key as keyof typeof currentState];

              if (
                typeof value !== 'function' &&
                !(
                  value &&
                  typeof value === 'object' &&
                  'nodeType' in value &&
                  (value as any).nodeType === 1
                ) &&
                !(value && typeof value === 'object' && 'window' in value)
              ) {
                acc[key as keyof SessionState] = value as any;
              }

              return acc;
            },
            {} as Partial<SessionState>
          );

          console.log(
            'cloneableSession when saving session to history is ',
            cloneableSession
          );

          const newSession: SessionState = cloneableSession as SessionState;

          const id = await db.sessions.add(newSession);

          console.log('id (saved): ', id);

          return id;
        } catch (e) {
          console.log('error:', e);

          return 'error';
        }
      },
    }),
    'session-store'
  )
);

// Create the main hook
export function useSessionManager() {
  const [s, setS] = useState('');

  const searchSessions = useCallback(
    async (query: string) => {
      if (!query) {
        return await db.sessions.toArray();
      }

      const sessions = await db.sessions
        .filter(
          (session) =>
            session.title.toLowerCase().includes(query.toLowerCase()) ||
            session.article.toLowerCase().includes(query.toLowerCase())
        )
        .sortBy('updatedAt');

      return sessions.reverse();
    },
    [s]
  );

  const findSessionById = useCallback(async (id: string) => {
    return await db.sessions.get(id);
  }, []);

  const deleteSessionById = useCallback(async (id: string) => {
    await db.sessions.delete(id);
    setS(Date.now().toString());
  }, []);

  const deleteSessionInBatch = useCallback(async (ids: string[]) => {
    await db.sessions.bulkDelete(ids);
  }, []);

  const deleteSessionAll = useCallback(async () => {
    const count = await db.sessions.count();

    await db.sessions.clear();
    setS(Date.now().toString());

    return count;
  }, []);

  const updateSessionArticleById = useCallback(
    async (id: string, article: string) => {
      await db.sessions.update(id, { article, updatedAt: Date.now() });
    },
    []
  );

  return {
    ...useSessionStore(),
    searchSessions,
    findSessionById,
    deleteSessionById,
    deleteSessionInBatch,
    deleteSessionAll,
    updateSessionArticleById,
  };
}
