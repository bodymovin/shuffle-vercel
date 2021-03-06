import { ChapterType } from '@prisma/client';
import {
  ActionFunction, json, LoaderFunction, redirect,
} from '@remix-run/node';
import {
  Form, Link, useLoaderData, useNavigate, useTransition,
} from '@remix-run/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { bodyParser } from 'remix-utils';
import { getUserPrefsFromRequest, UserPrefs } from '~/cookies';
import { i18n } from '~/i18n.server';
import { commitSession, getSessionFromRequest } from '~/sessions';
import styles from '~/styles/login.css';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { createUser, getSession, loginUser } from '~/utils/user.server';
import useShuffleLottie from '~/utils/hooks/useShuffleLottie';

export const action: ActionFunction = async ({ request }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const clonedRequest = request.clone();
  await new Promise((res) => {
    setTimeout(res, 0);
  });
  const body: any = await bodyParser.toJSON(request);
  const session = await getSessionFromRequest(request);
  const t = await i18n.getFixedT(request, 'index');
  let errorMessage;
  if (!body.email || !body.password || !body.passwordRepeat || !body.name) {
    session.flash('error', t('error_missing_fields'));
  } else if (body.password !== body.passwordRepeat) {
    session.flash('error', t('error_passwords_mismatch'));
  } else {
    const userPrefs: UserPrefs = await getUserPrefsFromRequest(request);
    let newUser;
    try {
      newUser = await createUser(body.email, body.name, body.password, userPrefs.games || 0);
    } catch (error: any) {
      if (error.status === 400) {
        errorMessage = t('error_user_registered');
      }
    }

    if (newUser) {
      // TODO: check if this is the best way to login the user after signup
      // TODO: with email confirmation active, login can't be performed automatically
      // decide whether to turn email confirmation off or display a message
      // await loginUser(clonedRequest, '/signup?status=success');
      return redirect('/signup?status=success', {
        headers: {
          'Set-Cookie': await commitSession(session),
        },
      });
    }
    session.flash('error', errorMessage || t('error_generic_message'));
  }
  return json({}, {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
};

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSessionFromRequest(request);
  const user = await getSession(request);
  const url = new URL(request.url);
  const signupComplete = url.searchParams.get('status') === 'success';
  if (user && !signupComplete) {
    return redirect(`/selection/${ChapterType.character}`);
  }
  return json(
    {
      error: session.get('error'),
      i18n: await i18n.getTranslations(request, ['index']),
      signupComplete,
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

function SignUp() {
  const { signupComplete, error } = useLoaderData();

  const [nameText, setNameText] = useState('');
  const [isAnimationComplete, setAnimationComplete] = useState(false);

  const navigate = useNavigate();
  const transition = useTransition();

  // This condition is true when signup is complete or is being submitted
  const isTransitioning = signupComplete || transition.state === 'loading' || transition.state === 'submitting';

  // Sets the animated text to the updated text field value
  const onBlur = (ev: React.FocusEvent<HTMLInputElement>) => {
    setNameText(ev.target.value);
  };

  // Sets the animation complete flag to true when animation is finished
  const onAnimationComplete = useCallback(() => {
    setAnimationComplete(true);
  }, [setAnimationComplete]);

  const [lottieElement, lottieControls] = useShuffleLottie(
    {
      path: '/routed/assets/forms/signup2.json',
      autoplay: false,
      loop: false,
    },
    {
      className: `form-anim ${isTransitioning ? '' : 'form-anim--hidden'}`,
    },
  );

  if (lottieControls) {
    lottieControls.onComplete = onAnimationComplete;
  }

  // When form is submitted and animation complete, navigate to stories
  useEffect(() => {
    if (isAnimationComplete && signupComplete) {
      navigate('/selection/character');
    }
  }, [isAnimationComplete, signupComplete, navigate]);

  // Sets the state of the animation.
  // - If it is being submitted, the animation plays from the beginning.
  // = If it is not submitted or it failed, animation stops.
  useEffect(() => {
    if (lottieControls) {
      if (isTransitioning) {
        lottieControls.setText(nameText, [0]);
        lottieControls.goToAndPlay(0);
      } else {
        lottieControls.goToAndStop(0);
        setAnimationComplete(false);
      }
    }
  }, [isTransitioning, setAnimationComplete, lottieControls, nameText]);

  const { t } = useTranslation('index');

  return (
    <div className="wrapper" style={{ background: 'white' }}>
      <div className="content">
        <div className="form-container">
          {lottieElement}
          <Form
            className="form"
            method="post"
          >
            <input
              type="text"
              name="name"
              placeholder={t('name_placeholder')}
              className="text-input"
              autoComplete="name"
              onBlur={onBlur}
              style={{ opacity: isTransitioning ? '0' : '1' }}
            />
            <input
              type="email"
              name="email"
              placeholder={t('email_placeholder')}
              className="text-input"
              autoComplete="email"
              required
            />
            <input
              type="password"
              name="password"
              placeholder={t('password_placeholder')}
              className="text-input"
              autoComplete="password"
            />
            <input
              type="password"
              name="passwordRepeat"
              placeholder={t('repeat_password_placeholder')}
              className="text-input"
              autoComplete="off"
            />
            <button type="submit" className="submit">{t('submit_button')}</button>
          </Form>
          { error
          && (
            <div>{error}</div>
          )}
        </div>
        <span className="or">{t('or_text')}</span>
        <Link to="/login" className="link">{t('login_button')}</Link>
        <span className="or">{t('or_text')}</span>
        <Link to={`/selection/${ChapterType.character}`} className="link">{t('go_to_stories_button')}</Link>
      </div>
    </div>
  );
}
export default SignUp;
