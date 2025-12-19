import en from './locales/en';
import fr from './locales/fr';

const locales: Record<string, any> = {
  en,
  fr,
};

export const getTranslation = (lang: string, key: string, params?: Record<string, string>): string => {
  const keys = key.split('.');
  let translation = locales[lang];

  for (const k of keys) {
    if (!translation[k]) {
      return key; // Return the key if translation not found
    }
    translation = translation[k];
  }

  // Replace placeholders with actual values
  if (params) {
    Object.keys(params).forEach(param => {
      translation = translation.replace(new RegExp(`{{${param}}}`, 'g'), params[param]);
    });
  }

  return translation;
};

export const getUserLanguage = (): string => {
  // In a real app, you would get this from user preferences, browser settings, etc.
  // For now, we'll default to English
  if (typeof window !== 'undefined') {
    return localStorage.getItem('language') || 'en';
  }
  return 'en';
};

export const setUserLanguage = (lang: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', lang);
  }
};