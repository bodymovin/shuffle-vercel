import { createCookie } from '@remix-run/node';

export interface UserPrefs {
  visitedSplash?: boolean,
  color1?: string,
  color2?: string,
  color3?: string,
  character?: string
  partner?: string
  object?: string
  vehicle?: string
  path?: string
  destination?: string
  games?: number
}

export const userPrefs = createCookie('user-prefs', {
  maxAge: 604_800, // one week
});

export const getUserPrefsFromRequest = async (request: Request): Promise<UserPrefs> => {
  const cookieHeader = request.headers.get('Cookie');
  const cookie = (await userPrefs.parse(cookieHeader)) || {};
  return cookie;
};

export const updateUserPrefs = async (request: Request, keys: UserPrefs) => {
  const cookie = {
    ...(await getUserPrefsFromRequest(request)),
    ...keys,
  };
  return userPrefs.serialize(cookie);
};
