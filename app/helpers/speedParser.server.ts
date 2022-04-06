import { bodyParser } from 'remix-utils';
import { getUserPrefsFromRequest, updateUserPrefs } from '~/cookies';
import { SpeedData, Speeds } from '~/interfaces/speeds';

const getSpeedFromCookie = async (request: Request): Promise<Speeds> => {
  const cookie = await getUserPrefsFromRequest(request);

  return cookie.speed || Speeds.SLOW;
};

const extractSpeedFromRequest = async (request: Request): Promise<SpeedData> => {
  const body: any = await bodyParser.toJSON(request);
  const speed: SpeedData = {
    speed: body.speed || Speeds.SLOW,
  };
  return speed;
};

const serializeCookieWithSpeed = async (request: Request, speed: SpeedData) => (
  updateUserPrefs(request, speed)
);

export {
  getSpeedFromCookie,
  extractSpeedFromRequest,
  serializeCookieWithSpeed,
};
