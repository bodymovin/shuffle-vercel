import client from '~/helpers/supabase/client.server';
import * as sessionStorage from '~/sessions';
import { Authenticator, AuthorizationError } from 'remix-auth';
import { SupabaseStrategy } from 'remix-auth-supabase';

export const supabaseStrategy = new SupabaseStrategy(
  {
    supabaseClient: client,
    sessionStorage,
    sessionKey: 'sb:session', // if not set, default is sb:session
    sessionErrorKey: 'sb:error', // if not set, default is sb:error
  },
  // simple verify example for email/password auth
  async ({ req, supabaseClient }) => {
    const form = await req.formData();
    const email = form?.get('email');
    const password = form?.get('password');

    if (!email) throw new AuthorizationError('Email is required');
    if (typeof email !== 'string') { throw new AuthorizationError('Email must be a string'); }

    if (!password) throw new AuthorizationError('Password is required');
    if (typeof password !== 'string') { throw new AuthorizationError('Password must be a string'); }

    return supabaseClient.auth.api
      .signInWithEmail(email, password)
      .then(({ data, error }): any => {
        if (error || !data) {
          throw new AuthorizationError(
            error?.message ?? 'No user session found',
          );
        }

        return data;
      });
  },
);

export const authenticator = new Authenticator<any>(sessionStorage, {
  sessionKey: supabaseStrategy.sessionKey, // keep in sync
  sessionErrorKey: supabaseStrategy.sessionErrorKey, // keep in sync
});

authenticator.use(supabaseStrategy);
