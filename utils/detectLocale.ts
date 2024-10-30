export const locales = ['zh', 'en', 'ja', 'de', 'fr', 'ko'];

export const detectLocale = (
  locale: string
): (typeof locales)[number] | null => {
  const detectedLocale = locale.split('-')[0];

  if (locales.includes(detectedLocale as (typeof locales)[number])) {
    return detectedLocale as (typeof locales)[number];
  }

  return null;
};
