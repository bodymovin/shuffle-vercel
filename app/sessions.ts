import { createCookieSessionStorage, Session } from '@remix-run/node';

const { getSession, commitSession, destroySession } = createCookieSessionStorage({
  // a Cookie from `createCookie` or the CookieOptions to create one
  cookie: {
    name: '__session',

    // all of these are optional
    domain: '192.168.1.8',
    expires: new Date(Date.now() + 60 * 60 * 24 * 7 * 4),
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7 * 4,
    path: '/',
    sameSite: 'lax',
    secrets: ['aaaa'],
    // secure: true,
  },
});

const getUserId = async (request: Request): Promise<string> => {
  const session = await getSession(
    request.headers.get('Cookie'),
  );
  return session.get('userId') || '';
};
const getSessionFromRequest = async (request: Request): Promise<Session> => {
  const session = await getSession(
    request.headers.get('Cookie'),
  );
  return session;
};

export {
  getSession,
  commitSession,
  destroySession,
  getUserId,
  getSessionFromRequest,
};
