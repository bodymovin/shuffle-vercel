import { RemixI18Next, FileSystemBackend } from 'remix-i18next';
import path from 'path';

// You will need to provide a backend to load your translations, here we use the
// file system one and tell it where to find the translations.

console.log('=======================');
console.log(__dirname);
const localesPath = process.env.NODE_ENV === 'development' ? './public/locales' : './output/server/pages/public/locales';

const backend = new FileSystemBackend(path.resolve(localesPath));

export const i18n = new RemixI18Next(backend, {
  fallbackLng: 'en', // here configure your default (fallback) language
  supportedLanguages: ['es', 'en'], // here configure your supported languages
  i18nextOptions: {

  }
});
