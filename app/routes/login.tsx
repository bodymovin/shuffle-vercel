import { ChapterType } from '@prisma/client';
import {
  ActionFunction, json, LoaderFunction, redirect,
} from '@remix-run/node';
import {
  Form, Link, useLoaderData, useTransition,
} from '@remix-run/react';
import { ANONYMOUS_ID } from '~/helpers/constants/user';
import { commitSession, getSessionFromRequest } from '~/sessions';
import styles from '~/styles/login.css';
import { getUser, loginUser } from '~/utils/user.server';
import { i18n } from '~/i18n.server';
import { useTranslation } from 'react-i18next';

export const action: ActionFunction = async ({ request }) => {
  try {
    await loginUser(request);
  } catch (error: any) {
    if (error.status === 302) {
      throw error;
    }
  }
  const session = await getSessionFromRequest(request);
  const t = await i18n.getFixedT(request, 'index');
  session.flash('error', t('error_wrong_email_pass'));

  return json({}, {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
};

export const loader: LoaderFunction = async ({ request }) => {
  //
  const session = await getSessionFromRequest(request);
  const url = new URL(request.url);
  const user = await getUser(request);
  if (user.id !== ANONYMOUS_ID && !url.searchParams.get('status')) {
    return redirect(`/selection/${ChapterType.character}`);
  }
  return json(
    {
      error: session.get('error'),
      i18n: await i18n.getTranslations(request, ['index']),
    },
    {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    },
  );
};

export function links() {
  return [
    {
      rel: 'stylesheet',
      href: styles,
    },
  ];
}

function Login() {
  const data = useLoaderData();
  const { t } = useTranslation('index');
  const transition = useTransition();
  console.log('transition', transition);

  return (
    <div className="wrapper">
      <div className="content">
        <div className="form-container">
          <Form
            className="form"
            method="post"
          >
            <input
              type="text"
              name="email"
              placeholder={t('email_placeholder')}
              className="text-input"
              autoComplete="email"
            />
            <input
              type="password"
              name="password"
              placeholder={t('password_placeholder')}
              className="text-input"
              autoComplete="password"
            />
            <button type="submit" className="submit">{t('submit_button')}</button>
            { data.error
              && (
                <div>{data.error}</div>
              )}
          </Form>
        </div>
        <span className="or">{t('or_text')}</span>
        <Link to="/signup" className="link">{t('signup_button')}</Link>
        <span className="or">{t('or_text')}</span>
        <Link to={`/selection/${ChapterType.character}`} className="link">{t('go_to_stories_button')}</Link>
      </div>
    </div>
  );
}
export default Login;
