import { ChapterType } from '@prisma/client';
import {
  ActionFunction, json, LoaderFunction, redirect,
} from '@remix-run/node';
import {
  Form, Link, useLoaderData,
} from '@remix-run/react';
import { bodyParser } from 'remix-utils';
import { commitSession, getSessionFromRequest } from '~/sessions';
import styles from '~/styles/login.css';
import { findUserByEmailAndPassword } from '~/utils/user.server';

export const action: ActionFunction = async ({ request }) => {
  const body: any = await bodyParser.toJSON(request);
  const session = await getSessionFromRequest(request);
  const user = await findUserByEmailAndPassword(body.email, body.password);
  if (user) {
    session.set('userId', user.id);
    return redirect(`/selection/${ChapterType.character}`, {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }
  session.flash('error', 'wrong email or password');
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

  return (
    <div className="wrapper">
      <div className="content">
        <Form
          className="form"
          method="post"
        >
          <input
            type="text"
            name="email"
            placeholder="email"
            className="text-input"
            autoComplete="email"
          />
          <input
            type="password"
            name="password"
            placeholder="password"
            className="text-input"
            autoComplete="password"
          />
          <button type="submit" className="submit">Submit</button>
          { data.error
            && (
              <div>{data.error}</div>
            )}
        </Form>
        <span className="or">Or</span>
        <Link to="/signup" className="link">Sign up</Link>
        <span className="or">Or</span>
        <Link to={`/selection/${ChapterType.character}`} className="link">Go to stories</Link>
      </div>
    </div>
  );
}
export default Login;
