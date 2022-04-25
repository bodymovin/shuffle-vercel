import { ActionFunction, LoaderFunction, redirect } from '@remix-run/node';
import {
  Form, Link, useLoaderData, useLocation,
} from '@remix-run/react';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Language } from 'remix-i18next';
import { bodyParser } from 'remix-utils';
import { i18n } from '~/i18n.server';
import { updateUserPassword } from '~/utils/user.server';
import styles from '~/styles/forms.css';

export function links() {
  return [
    {
      rel: 'stylesheet',
      href: styles,
    },
  ];
}

enum FormStatus {
  IDLE = 'idle',
  SUCCESS = 'success',
  FAILED = 'failed',
  UNHANDLED = 'unhandled',
}

type LoaderData = {
  i18n: Record<string, Language>
  status: string
}

export const loader: LoaderFunction = async ({ request }):Promise<LoaderData> => {
  const url = new URL(request.url);
  const status = url.searchParams.get('status') || '';
  return {
    i18n: await i18n.getTranslations(request, ['index']),
    status,
  };
};

export const action: ActionFunction = async ({ request }) => {
  const body: any = await bodyParser.toJSON(request);
  let status = FormStatus.IDLE;
  if (!body.password || !body.password_confirm || body.password !== body.password_confirm) {
    status = FormStatus.FAILED;
  } else if (body.password && body.access_token) {
    const isPasswordUpdated = await updateUserPassword(body.password, body.access_token);
    status = isPasswordUpdated ? FormStatus.SUCCESS : FormStatus.UNHANDLED;
  }
  return redirect(`/reset-password${status !== FormStatus.IDLE ? `?status=${status}` : ''}`);
};

function buildForm(t: TFunction, params: URLSearchParams) {
  return (
    <Form method="post">
      <input
        type="password"
        name="password"
        className="shuffle-input"
        placeholder={t('password_placeholder')}
      />
      <input
        type="password"
        name="password_confirm"
        className="shuffle-input"
        placeholder={t('repeat_password_placeholder')}
      />
      <input
        type="hidden"
        name="access_token"
        value={params.get('access_token') || ''}
      />
      <button
        className="shuffle-button"
        type="submit"
      >
        {t('submit_button')}
      </button>
    </Form>
  );
}

function buildStatusMessage(t: TFunction, status: FormStatus, params: URLSearchParams) {
  if (status === FormStatus.SUCCESS) {
    return (
      <div>
        <div>{t('reset_password_success_message')}</div>
        <Link to="/login" className="shuffle-button">
          {t('menu_login')}
        </Link>
      </div>
    );
  }
  if (status === FormStatus.FAILED) {
    return (
      <div>
        <div>{t('reset_password_error_message')}</div>
        {buildForm(t, params)}
        <Link to="/forgot-password" className="shuffle-link">
          {t('reset_password')}
        </Link>
        <Link to="/login" className="shuffle-link">
          {t('login_button')}
        </Link>
      </div>
    );
  }
  if (status === FormStatus.UNHANDLED) {
    return (
      <div>
        <div>{t('reset_password_unhandled_message')}</div>
        <Link to="/forgot-password" className="shuffle-button">
          {t('reset_password')}
        </Link>
        <Link to="/login" className="shuffle-button">
          {t('login_button')}
        </Link>
      </div>
    );
  }
  return (
    <>
      <h1>{t('reset_password_title')}</h1>
      {buildForm(t, params)}
    </>
  );
}

function ResetPassword() {
  const { status } = useLoaderData();
  const { t } = useTranslation('index');
  const location = useLocation();
  const params = new URLSearchParams(location.hash.replace('#', '?'));
  return (
    <div className="wrapper">
      {buildStatusMessage(t, status, params)}
    </div>
  );
}
export default ResetPassword;
