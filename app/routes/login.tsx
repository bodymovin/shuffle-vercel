import { ChapterType } from '@prisma/client';
import {
  ActionFunction, json, LoaderFunction, redirect,
} from '@remix-run/node';
import {
  Form, Link, useLoaderData, useNavigate, useTransition,
} from '@remix-run/react';
import { ANONYMOUS_ID } from '~/helpers/constants/user';
import { commitSession, getSessionFromRequest } from '~/sessions';
import styles from '~/styles/login.css';
import { getUser, loginUser } from '~/utils/user.server';
import { i18n } from '~/i18n.server';
import { useTranslation } from 'react-i18next';
import useShuffleLottie from '~/utils/hooks/useShuffleLottie';
import {
  useCallback, useEffect, useRef, useState,
} from 'react';

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
  // Uncomment for testing purposes
  // await new Promise((resolve) => { setTimeout(resolve, 2000); });
  const url = new URL(request.url);
  const user = await getUser(request);
  if (user.id !== ANONYMOUS_ID && !url.searchParams.get('status')) {
    return redirect(`/selection/${ChapterType.character}`);
  }
  const loginComplete = url.searchParams.get('status') === 'success';
  return json(
    {
      error: session.get('error'),
      i18n: await i18n.getTranslations(request, ['index']),
      loginComplete,
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
  const { error, loginComplete } = useLoaderData();
  const { t } = useTranslation('index');
  const navigate = useNavigate();
  const transition = useTransition();
  const [isAnimationComplete, setAnimationComplete] = useState(false);
  const [isAnimationLoaded, setAnimationLoaded] = useState(false);
  const passwordRef = useRef<HTMLInputElement|null>(null);

  // This condition is true when signup is complete or is being submitted
  const isTransitioning = loginComplete || transition.state === 'loading' || transition.state === 'submitting';

  // Sets the animation complete flag to true when animation is finished
  const onAnimationComplete = useCallback(() => {
    setAnimationComplete(true);
  }, [setAnimationComplete]);

  const [lottieElement] = useShuffleLottie(
    {
      path: '/routed/assets/forms/login2.json',
      autoplay: true,
      loop: true,
    },
    {
      className: 'form-anim',
    },
  );

  const [lottieElementOutro, lottieControlsOutro] = useShuffleLottie(
    {
      path: '/routed/assets/forms/login_outro.json',
      autoplay: false,
      loop: false,
    },
    {
    },
  );

  if (lottieControlsOutro) {
    lottieControlsOutro.onComplete = onAnimationComplete;
    lottieControlsOutro.onLoad = () => {
      setAnimationLoaded(true);
      lottieControlsOutro.setText('', [0]);
    };
  }

  // When form is submitted and animation complete, navigate to stories
  useEffect(() => {
    if (isAnimationComplete && loginComplete) {
      navigate('/selection/character');
    }
  }, [isAnimationComplete, loginComplete, navigate]);

  // Sets the state of the animation.
  // - If it is being submitted, the animation plays from the beginning.
  // = If it is not submitted or it failed, animation stops.
  useEffect(() => {
    if (lottieControlsOutro && isAnimationLoaded) {
      if (isTransitioning) {
        const text = passwordRef.current
          ? Array.from({ length: passwordRef.current.value.length }, () => '•').join('')
          : '';
        lottieControlsOutro.setText(text, [0]);
        lottieControlsOutro.goToAndPlay(0);
      } else {
        lottieControlsOutro.goToAndPlay(0);
        lottieControlsOutro.setText('', [0]);
        setAnimationComplete(false);
      }
    }
  }, [isTransitioning, setAnimationComplete, lottieControlsOutro, isAnimationLoaded]);

  return (
    <div className="wrapper">
      <div className="content">
        <div className="form-container">
          {lottieElement}
          <div
            className="form-anim"
            style={{
              opacity: isTransitioning ? 1 : 0,
            }}
          >
            {lottieElementOutro}
          </div>
          <div className="form-elements">
            <Form
              className="form"
              method="post"
            >
              <input
                type="text"
                name="email"
                placeholder={t('email_placeholder')}
                className="text-input"
                id="email-input"
                autoComplete="email"
              />
              <input
                type="password"
                name="password"
                ref={passwordRef}
                placeholder={t('password_placeholder')}
                className="text-input"
                id="password-input"
                autoComplete="password"
                style={{
                  opacity: isTransitioning ? 0 : 1,
                }}
              />
              <button type="submit" className="submit">{t('submit_button')}</button>
            </Form>
            <div className="separator">
              <span className="separator-line" />
              <span className="separator-text">{t('or_text')}</span>
              <span className="separator-line" />
            </div>
            <div className="links">
              <Link to="/signup" className="link" id="signup-link">{t('signup_button')}</Link>
              <Link to={`/selection/${ChapterType.character}`} className="link" id="story-link">{t('go_to_stories_button')}</Link>
            </div>
            { error
              && (
                <div>{error}</div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default Login;
