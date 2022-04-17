import { User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { redirect } from '@remix-run/node';
import supabaseClient from '~/helpers/supabase/client.server';
import { getUserPrefsFromRequest } from '~/cookies';
import { errorCodes } from '~/helpers/constants/prisma';
import { ANONYMOUS_ID } from '~/helpers/constants/user';
import { destroySession, getSessionFromRequest } from '~/sessions';
import { db } from './db.server';
import { hash, validate } from './password.server';

export const getUserById = async (id: string): Promise<User | null> => {
  const user = await db.user.findUnique({
    where: {
      id,
    },
  });
  return user;
};

export const createUser = async (
  email: string,
  name: string,
  password: string,
  games: number,
): Promise<User | null> => {
  const { user, session, error } = await supabaseClient.auth.signUp({
    email,
    password,
  });
  console.log(user, session, error);
  return {
    email,
    name,
    password,
    id: 'a',
    games: 0,
  };
};

export const createUser2 = async (
  email: string,
  name: string,
  password: string,
  games: number,
): Promise<User | null> => {
  try {
    const hashedPassword = await hash(password);
    const user = await db.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        games,
      },
    });
    return user;
  } catch (error) {
    // TODO handle error types
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === errorCodes.UNIQUE_CONSTRAINT_FAILED) {
        // User already exists
        console.log('USER ALREADY EXISTS');
      }
    }
    return null;
  }
};

export const updateUser = async (user: User): Promise<User> => {
  const updatedUser = await db.user.update({
    data: user,
    where: {
      id: user.id,
    },
  });
  return updatedUser;
};

export const findUserByEmailAndPassword = async (
  email: string,
  password: string,
): Promise<User | null> => {
  const user = await db.user.findUnique({
    where: {
      email,
    },
  });

  if (user) {
    const isCorrectPassword = await validate(password, user.password);
    if (isCorrectPassword) {
      return user;
    }
  }
  return null;
};

export const findUserByEmail = async (
  email: string,
): Promise<User | null> => {
  const user = await db.user.findUnique({
    where: {
      email,
    },
  });
  return user;
};

export async function logout(request: Request) {
  const session = await getSessionFromRequest(request);
  return redirect('/login', {
    headers: {
      'Set-Cookie': await destroySession(session),
    },
  });
}

export const createAnonymousUserFromRequest = async (request: Request): Promise<User> => {
  const userPrefs = await getUserPrefsFromRequest(request);
  const user: User = {
    id: ANONYMOUS_ID,
    email: '',
    name: '',
    password: '',
    games: userPrefs.games || 0,
  };
  return user;
};

export const getUser = async (request: Request): Promise<User> => {
  const session = await getSessionFromRequest(request);
  const userId = session.get('userId');
  let user: User | null = null;
  if (userId) {
    user = await getUserById(userId);
  }
  if (!user) {
    user = await createAnonymousUserFromRequest(request);
  }
  return user;
};

export const getSupabaseUser = async (request: Request): Promise<any> => {
  const user = await supabaseClient.auth.api.getUserByCookie(request);
  console.log('user', user);
  return user;
}