'use client';
import React, {
  ReactNode,
  createContext,
  useContext,
  useLayoutEffect,
  useState,
} from 'react';

import useTranslation, { UseTranslationResult } from '@/hooks/use-translation';

const LanguageContext = createContext<UseTranslationResult | null>(null);

export const useLanguageContext = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      'useLanguageContext must be used within a LanguageProvider'
    );
  }

  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
  loadingComponent?: ReactNode;
}

const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
  loadingComponent = <div>Loading...</div>,
}) => {
  const [isClient, setIsClient] = useState(false);
  const translationResult = useTranslation();

  useLayoutEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || !translationResult.isClientReady) {
    return <>{loadingComponent}</>;
  }

  return (
    <LanguageContext.Provider value={translationResult}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;
