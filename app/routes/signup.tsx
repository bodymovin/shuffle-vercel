import { ChapterType } from '@prisma/client';
import {
  ActionFunction, json, LoaderFunction, redirect,
} from '@remix-run/node';
import {
  Form, Link, useLoaderData,
} from '@remix-run/react';
import React, { useState } from 'react';
import { bodyParser } from 'remix-utils';
import LottieComponent from '~/components/Lottie';
import TextLottie from '~/components/lottie/TextLottie';
import { commitSession, getSessionFromRequest } from '~/sessions';
import styles from '~/styles/login.css';
import { createUser, findUserByEmail } from '~/utils/user.server';

export const action: ActionFunction = async ({ request }) => {
  const body: any = await bodyParser.toJSON(request);
  const session = await getSessionFromRequest(request);
  const user = await findUserByEmail(body.email);
  if (user) {
    session.flash('error', 'email already registered');
  } else if (!body.email || !body.password || !body.passwordRepeat || !body.name) {
    session.flash('error', 'please complete all fields');
  } else if (body.password !== body.passwordRepeat) {
    session.flash('error', 'passwords don\'t match');
  } else {
    const newUser = await createUser(body.email, body.name, body.password);
    if (newUser) {
      session.set('userId', newUser.id);
      if (session.get('userId')) {
        return redirect(`/selection/${ChapterType.character}`, {
          headers: {
            'Set-Cookie': await commitSession(session),
          },
        });
      }
    } else {
      session.flash('error', 'something went wrong');
    }
  }
  return json({}, {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
};

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSessionFromRequest(request);
  if (session.get('userId')) {
    return redirect(`/selection/${ChapterType.character}`);
  }
  return json(
    {
      error: session.get('error'),
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

  const [nameText, setNameText] = useState('');
  const [isFocused, setFocus] = useState(false);

  const onFocus = () => {
    setFocus(true);
    setNameText('');
  };

  const onBlur = (ev: React.FocusEvent<HTMLInputElement>) => {
    setFocus(false);
    setNameText(ev.target.value);
  };

  // useEffect(() => {
  // }, [counter]);

  const formClassNames = [
    'form-container',
  ];

  return (
    <div className="wrapper">
      <div className="content">
        <div className={formClassNames.join(' ')}>
          <div className="form-anim">
            {/* <TextLottie
              path="/routed/assets/forms/signup2.json"
              autoplay
              loop
              text={nameText}
            /> */}
          </div>
          <Form
            className="form"
            method="post"
          >
            <input
              type="text"
              name="name"
              placeholder="name"
              className="text-input"
              autoComplete="name"
              onFocus={onFocus}
              onBlur={onBlur}
              style={{ color: isFocused ? 'rgba(0,0,0,1)' : 'rgba(0,0,0,1)' }}
            />
            <input
              type="email"
              name="email"
              placeholder="email"
              className="text-input"
              autoComplete="email"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="password"
              className="text-input"
              autoComplete="password"
            />
            <input
              type="password"
              name="passwordRepeat"
              placeholder="repeat password"
              className="text-input"
              autoComplete="off"
            />
            <button type="submit" className="submit">Submit</button>
          </Form>
          { data.error
          && (
            <div>{data.error}</div>
          )}
        </div>
        <span className="or">Or</span>
        <Link to="/login" className="link">Sign in</Link>
        <span className="or">Or</span>
        <Link to={`/selection/${ChapterType.character}`} className="link">Go to stories</Link>
      </div>
    </div>
  );
}
export default Login;
