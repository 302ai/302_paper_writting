'use client';
import { getCookie, setCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { detectLocale } from '@/utils/detectLocale';

export const LANGUAGE_COOKIE_NAME = 'preferredLanguage';

const useLanguage = (
  supportedLanguages: string[],
  defaultLanguage: string
): [string, (lang: string) => void, boolean] => {
  const router = useRouter();
  const [language, setLanguageState] = useState<string>(defaultLanguage);
  const [isClientReady, setIsClientReady] = useState(false);

  useEffect(() => {
    // Client initialization
    const searchParams = new URLSearchParams(window.location.search);
    const searchLang = detectLocale(searchParams.get('lang') || '') || '';

    const storedLang = localStorage.getItem(LANGUAGE_COOKIE_NAME);
    // console.log(searchLang)
    const cookieLang = getCookie(LANGUAGE_COOKIE_NAME) as string | undefined;
    const browserLang = navigator.language.split('-')[0];

    let initialLang = defaultLanguage;

    if (searchLang && supportedLanguages.includes(searchLang)) {
      initialLang = searchLang;
    } else if (storedLang && supportedLanguages.includes(storedLang)) {
      initialLang = storedLang;
    } else if (cookieLang && supportedLanguages.includes(cookieLang)) {
      initialLang = cookieLang;
    } else if (supportedLanguages.includes(browserLang)) {
      initialLang = browserLang;
    }

    if (initialLang !== language) {
      setLanguageState(initialLang);
      setCookie(LANGUAGE_COOKIE_NAME, initialLang, {
        maxAge: 30 * 24 * 60 * 60,
      }); // 30 days
      localStorage.setItem(LANGUAGE_COOKIE_NAME, initialLang);
    }

    setIsClientReady(true);
  }, []);

  const setLanguage = (lang: string) => {
    if (supportedLanguages.includes(lang)) {
      setLanguageState(lang);
      setCookie(LANGUAGE_COOKIE_NAME, lang, { maxAge: 30 * 24 * 60 * 60 }); // 30 days
      localStorage.setItem(LANGUAGE_COOKIE_NAME, lang);
      router.refresh(); // Refresh the current route data
    }
  };

  return [language, setLanguage, isClientReady];
};

export default useLanguage;
