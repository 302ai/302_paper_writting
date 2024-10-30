import { useCallback, useMemo } from 'react';

import { getTranslation, translations } from '../messages/translations';

import useLanguage from './use-language';

type TranslationFunction = (
  key: string,
  params?: Record<string, string>
) => string;

export interface UseTranslationResult {
  t: TranslationFunction;
  language: string;
  setLanguage: (lang: string) => void;
  isClientReady: boolean;
}

const useTranslation = (): UseTranslationResult => {
  const supportedLanguages = Object.keys(translations);
  const [language, setLanguage, isClientReady] = useLanguage(
    supportedLanguages,
    'en'
  );

  const t: TranslationFunction = useCallback(
    (key: string, params?: Record<string, string>) => {
      return getTranslation(language, key, params);
    },
    [language]
  );

  return useMemo(
    () => ({ t, language, setLanguage, isClientReady }),
    [t, language, setLanguage, isClientReady]
  );
};

export default useTranslation;
