import { Profile } from '@prisma/client';
import supabaseClient from '~/helpers/supabase/client.server';
import { getUserPrefsFromRequest } from '~/cookies';
import { ANONYMOUS_ID } from '~/helpers/constants/user';
import { User, UserSession } from '~/interfaces/user';
import { UserCredentials } from '@supabase/supabase-js';
import { db } from './db.server';
import { authenticator } from './auth.server';

export const getUserProfile = async (id: string): Promise<Profile | null> => {
  const profile = await db.profile.findUnique({
    where: {
      id,
    },
  });
  return profile;
};

export const updateUser = async (user: User): Promise<Profile> => {
  const updatedProfile = await db.profile.update({
    data: user,
    where: {
      id: user.id,
    },
  });
  return updatedProfile;
};

export const createUser = async (
  email: string,
  name: string,
  password: string,
  games: number,
): Promise<UserCredentials | null> => {
  const { user: userCredentials, error } = await supabaseClient.auth.signUp({
    email,
    password,
  });
  if (error || !userCredentials) {
    if (error?.status === 400) {
      throw error;
    }
    return null;
  }
  const user = {
    id: userCredentials.id,
    name,
    games,
  };
  await updateUser(user);
  return userCredentials;
};

export async function logout(request: Request) {
  await authenticator.logout(request, { redirectTo: '/splash' });
}

export const createAnonymousUserFromRequest = async (request: Request): Promise<User> => {
  const userPrefs = await getUserPrefsFromRequest(request);
  const user: User = {
    id: ANONYMOUS_ID,
    name: '',
    games: userPrefs.games || 0,
  };
  return user;
};

export const getSession = async (
  request: Request,
): Promise<UserSession> => authenticator.isAuthenticated(request);

export const getUser = async (request: Request): Promise<User> => {
  let user: User | null = null;
  const sbUser = await getSession(request);
  if (sbUser) {
    const userProfile = await getUserProfile(sbUser.user.id);
    user = {
      id: sbUser.user.id,
      games: userProfile?.games || 0,
      name: userProfile?.name || '',
    };
  } else {
    user = await createAnonymousUserFromRequest(request);
  }
  return user;
};

export const loginUser = async (request: Request, redirect: string = '/login?status=success'): Promise<any> => authenticator.authenticate('sb', request, {
  successRedirect: redirect,
});
