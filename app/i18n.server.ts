import { RemixI18Next, FileSystemBackend } from 'remix-i18next';
import path from 'path';

// You will need to provide a backend to load your translations, here we use the
// file system one and tell it where to find the translations.

const localesPath = process.env.NODE_ENV === 'development' 
  ? './public/locales' // this is the local path
  : './output/server/pages/public/locales'; // this is the vercel path, found with trial and error

const backend = new FileSystemBackend(path.resolve(localesPath));

export const i18n = new RemixI18Next(backend, {
  fallbackLng: 'en', // here configure your default (fallback) language
  supportedLanguages: ['es', 'en'], // here configure your supported languages
  i18nextOptions: {

  }
});
