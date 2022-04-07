import i18next from 'i18next';
import { hydrate } from 'react-dom';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { RemixBrowser } from '@remix-run/react';

i18next
  .use(initReactI18next)
  .init({
    supportedLngs: ['es', 'en'],
    defaultNS: 'index',
    fallbackLng: 'en',
    // I recommend you to always disable react.useSuspense for i18next
    react: { useSuspense: false },
  })
  .then(() => hydrate(
    <I18nextProvider i18n={i18next}>
      <RemixBrowser />
    </I18nextProvider>,
    document,
  ));
