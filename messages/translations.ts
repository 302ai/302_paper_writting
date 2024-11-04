import en from './en.json';
import zh from './zh.json';
import de from './de.json';
import fr from './fr.json';
import ja from './ja.json';
import ko from './ko.json';

export const translations = {
  zh: zh,
  en: en,
  de: de,
  fr: fr,
  ja: ja,
  ko: ko,
};

export const getTranslation = (
  lang: string,
  key: string,
  params?: Record<string, string>
): string => {
  const keys = key.split('.');
  let translation = (translations as any)[lang] as any;

  for (const k of keys) {
    if (translation[k] !== undefined) {
      translation = translation[k];
    } else {
      return key;
    }
  }

  if (params) {
    Object.keys(params).forEach((paramKey) => {
      translation = translation.replace(`{${paramKey}}`, params[paramKey]);
    });
  }

  return translation;
};
