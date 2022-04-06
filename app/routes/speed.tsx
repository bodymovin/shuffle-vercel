import { ActionFunction } from '@remix-run/node';
import { extractSpeedFromRequest, serializeCookieWithSpeed } from '~/helpers/speedParser.server';

export const action: ActionFunction = async ({ request }) => {
  const speed = await extractSpeedFromRequest(request);
  const cookie = await serializeCookieWithSpeed(request, speed);
  return new Response(JSON.stringify(speed), {
    headers: {
      'Set-Cookie': cookie,
      'Content-Type': 'application/json',
    },
  });
};
