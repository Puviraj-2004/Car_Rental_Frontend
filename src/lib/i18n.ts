import en from './locales/en';
import fr from './locales/fr';

const locales: Record<string, any> = {
  en,
  fr,
};

export const getTranslation = (lang: string, key: string, params?: Record<string, string>): string => {
  const keys = key.split('.');
  
  // Default to English if lang is invalid
  let translation = locales[lang] || locales['en']; 

  // Traverse the object
  for (const k of keys) {
    if (translation && translation[k]) {
      translation = translation[k];
    } else {
      // Key not found
      return key; 
    }
  }

  // If result is not a string (e.g. it's still an object), return key
  if (typeof translation !== 'string') {
    return key;
  }

  // Replace {{placeholders}}
  if (params) {
    Object.keys(params).forEach(param => {
      translation = translation.replace(new RegExp(`{{${param}}}`, 'g'), params[param]);
    });
  }

  return translation;
};

// Get User Language from LocalStorage
export const getUserLanguage = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('language') || 'en';
  }
  return 'en';
};

// Set User Language
export const setUserLanguage = (lang: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', lang);
    // Optional: Refresh page to apply changes if not using a reactive context
    // window.location.reload(); 
  }
};