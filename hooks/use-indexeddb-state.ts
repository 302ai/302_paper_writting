import { useUnmount } from 'ahooks';
import { debounce } from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';

// Custom error type
class IndexedDBError extends Error {
  constructor(
    message: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'IndexedDBError';
  }
}

// Version control and migration
interface MigrationStep {
  version: number;
  migrate: (db: IDBDatabase) => void;
}

// Configuration options
export interface IndexedDBStateOptions<T> {
  defaultValue?: T | (() => T);
  onError?: (error: IndexedDBError) => void;
  dbName?: string;
  storeName?: string;
  version?: number;
  prefixKey?: string;
  validateValue?: (value: T) => boolean;
  migrations?: MigrationStep[];
  debounceTime?: number;
}

// Memory cache
const cache = new Map<string, any>();

// Open database
async function openDatabase(
  dbName: string,
  storeName: string,
  version: number,
  migrations: MigrationStep[]
): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, version);

    request.onerror = () =>
      reject(new IndexedDBError('Failed to open database', request.error));
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      }

      // Execute migrations
      migrations
        .filter((migration) => migration.version <= version)
        .sort((a, b) => a.version - b.version)
        .forEach((migration) => migration.migrate(db));
    };
  });
}

// Get value
async function getValue<T>(
  db: IDBDatabase,
  storeName: string,
  key: string
): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);

    request.onerror = () =>
      reject(new IndexedDBError('Failed to get value', request.error));
    request.onsuccess = () => resolve(request.result);
  });
}

// Set value
async function setValue<T>(
  db: IDBDatabase,
  storeName: string,
  key: string,
  value: T
): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(value, key);

    request.onerror = () =>
      reject(new IndexedDBError('Failed to set value', request.error));
    request.onsuccess = () => resolve();
  });
}

// Type checking
function isFunction<T>(value: unknown): value is (val: any) => T {
  return typeof value === 'function';
}

// Main Hook
export function useIndexedDBState<T>(
  key: string,
  options: IndexedDBStateOptions<T> = {}
) {
  const {
    defaultValue,
    onError = (error: IndexedDBError) => {
      console.error('IndexedDB Error:', error);
    },
    dbName = 'AppDatabase',
    storeName = 'keyValueStore',
    version = 1,
    prefixKey = '',
    validateValue = (_value: T) => true,
    migrations = [],
    debounceTime = 300,
  } = options;

  const [state, setState] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const stateRef = useRef(state);
  const dbRef = useRef<IDBDatabase | null>(null);
  const compositeKey = `${prefixKey}${key}`;

  // Update state reference
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Get value from cache or database
  const getStoredValue = useCallback(async (): Promise<T | undefined> => {
    if (cache.has(compositeKey)) {
      return cache.get(compositeKey);
    }

    if (!dbRef.current) return undefined;

    try {
      const storedValue = await getValue<T>(
        dbRef.current,
        storeName,
        compositeKey
      );

      if (storedValue !== undefined && validateValue(storedValue)) {
        cache.set(compositeKey, storedValue);

        return storedValue;
      }
    } catch (error) {
      onError(new IndexedDBError('Failed to get stored value', error));
    }

    return undefined;
  }, [compositeKey, storeName, validateValue, onError]);

  // Update state
  const updateState = useCallback(
    (newValue: T | ((prevState: T | undefined) => T)) => {
      const updatedValue = isFunction<T>(newValue)
        ? newValue(stateRef.current)
        : newValue;

      // @ts-ignore
      if (updatedValue === undefined || !validateValue(updatedValue)) {
        onError(new IndexedDBError('Invalid value'));

        return;
      }

      setState(updatedValue);
      cache.set(compositeKey, updatedValue);
      // @ts-ignore
      debouncedUpdateDB(updatedValue);
    },
    [compositeKey, validateValue, onError]
  );

  // Debounced update database
  const debouncedUpdateDB = useCallback(
    debounce(async (value: T) => {
      if (!dbRef.current) return;

      try {
        await setValue(dbRef.current, storeName, compositeKey, value);
      } catch (error) {
        onError(new IndexedDBError('Failed to update database', error));
      }
    }, debounceTime),
    [compositeKey, storeName, onError, debounceTime]
  );

  // Initialize database and state
  useEffect(() => {
    let isMounted = true;
    const initDB = async () => {
      try {
        const db = await openDatabase(dbName, storeName, version, migrations);

        dbRef.current = db;

        if (isMounted) {
          const storedValue = await getStoredValue();

          if (storedValue !== undefined) {
            setState(storedValue);
          } else if (defaultValue !== undefined) {
            const initialValue = isFunction<T>(defaultValue)
              ? defaultValue()
              : defaultValue;

            setState(initialValue);
            updateState(initialValue);
          }

          setLoading(false);
        }
      } catch (error) {
        onError(new IndexedDBError('Failed to initialize database', error));
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initDB();

    return () => {
      isMounted = false;
    };
  }, [
    dbName,
    storeName,
    version,
    compositeKey,
    defaultValue,
    getStoredValue,
    updateState,
    onError,
  ]);

  // Clean up
  useUnmount(() => {
    if (dbRef.current) {
      dbRef.current.close();
    }
    cache.delete(compositeKey);
  });

  // Batch update function
  const batchUpdate = useCallback(
    async (updates: Record<string, T>) => {
      if (!dbRef.current) return;

      const transaction = dbRef.current.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);

      for (const [key, value] of Object.entries(updates)) {
        const compositeKey = `${prefixKey}${key}`;

        if (validateValue(value)) {
          store.put(value, compositeKey);
          cache.set(compositeKey, value);
        } else {
          onError(new IndexedDBError(`Invalid value for key: ${key}`));
        }
      }

      return new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () =>
          reject(new IndexedDBError('Batch update failed', transaction.error));
      });
    },
    [storeName, prefixKey, validateValue, onError]
  );

  return {
    state,
    updateState,
    loading,
    batchUpdate,
  };
}
