import type { Prisma, Profile } from '@prisma/client';
import supabaseClient from '~/helpers/supabase/client.server';
import { getUserPrefsFromRequest } from '~/cookies';
import { ANONYMOUS_ID } from '~/helpers/constants/user';
import type { User, UserSession } from '~/interfaces/user';
import type { UserCredentials } from '@supabase/supabase-js';
import stripe from '~/helpers/stripe/stripe';
import { db } from './db.server';
import { authenticator } from './auth.server';

const createStripeCustomer = async (email: string): Promise<string> => {
  try {
    const stripeCustomer = await stripe.customers.create({
      email,
    });
    return stripeCustomer.id;
  } catch (error) {
    return '';
  }
};

export const getUserProfile = async (id: string) => {
  const profile = await db.profile.findUnique({
    where: {
      id,
    },
    include: {
      userStories: true,
      userCartItems: {
        where: {
          status: {
            equals: 'pending',
          },
        },
      },
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
  const stripeCustomerId = await createStripeCustomer(email);
  const user = {
    id: userCredentials.id,
    name,
    games,
    stripe_customer: stripeCustomerId,
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
    stripe_customer: '',
    stories: [],
  };
  return user;
};

export const getSession = async (
  request: Request,
): Promise<UserSession> => authenticator.isAuthenticated(request);

type ProfileWithStories = Prisma.PromiseReturnType<typeof getUserProfile>

export const getUser = async (request: Request): Promise<User> => {
  let user: User | null = null;
  const sbUser = await getSession(request);
  if (sbUser) {
    const userProfile: ProfileWithStories = await getUserProfile(sbUser.user.id);
    user = {
      id: sbUser.user.id,
      games: userProfile?.games || 0,
      name: userProfile?.name || '',
      stripe_customer: userProfile?.stripe_customer || '',
      stories: userProfile?.userStories || [],
    };
  } else {
    user = await createAnonymousUserFromRequest(request);
  }
  return user;
};

export const loginUser = async (
  request: Request,
  redirect: string = '/login?status=success',
): Promise<any> => authenticator.authenticate('sb', request, {
  successRedirect: redirect,
});

export const resetPasswordForEmail = async (email: string, origin: string): Promise<boolean> => {
  // Ignoring the error to prevent leaking information
  await supabaseClient.auth.api.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`,
  });
  return true;
};

export const updateUserPassword = async (
  password: string,
  accessToken: string,
): Promise<boolean> => {
  const { error } = await supabaseClient.auth.api.updateUser(accessToken, {
    password,
  });
  return !error;
};
