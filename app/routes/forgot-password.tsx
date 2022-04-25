import { ActionFunction, LoaderFunction, redirect } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { Language } from 'remix-i18next';
import { bodyParser } from 'remix-utils';
import { i18n } from '~/i18n.server';
import { resetPasswordForEmail } from '~/utils/user.server';
import styles from '~/styles/forms.css';

export function links() {
  return [
    {
      rel: 'stylesheet',
      href: styles,
    },
  ];
}

type LoaderData = {
  i18n: Record<string, Language>
  formSent: boolean
}

export const loader: LoaderFunction = async ({ request }):Promise<LoaderData> => {
  const url = new URL(request.url);
  const formSent = url.searchParams.get('status') === 'success';
  return {
    i18n: await i18n.getTranslations(request, ['index']),
    formSent,
  };
};

export const action: ActionFunction = async ({ request }) => {
  const body: any = await bodyParser.toJSON(request);
  const url = new URL(request.url);
  let isSent = false;
  if (body.email) {
    isSent = await resetPasswordForEmail(body.email, url.origin);
  }
  return redirect(`/forgot-password${isSent ? '?status=success' : ''}`);
};

function ForgotPassword() {
  const { t } = useTranslation('index');
  const { formSent } = useLoaderData();
  return (
    <div className="wrapper">
      <h1>{t('forgot_password_title')}</h1>
      <Form method="post">
        <input
          key={formSent}
          type="email"
          name="email"
          className="shuffle-input"
        />
        <button
          type="submit"
          className="shuffle-button"
        >
          {t('submit_button')}
        </button>
      </Form>
      {formSent
      && <div>{t('forgot_password_sent_message')}</div>}
    </div>
  );
}
export default ForgotPassword;
