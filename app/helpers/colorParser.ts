import { bodyParser } from 'remix-utils';
import { getUserPrefsFromRequest, updateUserPrefs } from '~/cookies';
import { ColorSet } from '~/interfaces/colors';

const DEFAULT_COLOR_1 = '#353535';
const DEFAULT_COLOR_2 = '#FFEBD5';
const DEFAULT_COLOR_3 = '#F3E7D6';

const getColorsFromCookie = async (request: Request): Promise<ColorSet> => {
  const cookie = await getUserPrefsFromRequest(request);
  const colors = {
    color1: cookie.color1 || DEFAULT_COLOR_1,
    color2: cookie.color2 || DEFAULT_COLOR_2,
    color3: cookie.color3 || DEFAULT_COLOR_3,
  };
  return colors;
};

const extractColorsFromRequest = async (request: Request): Promise<ColorSet> => {
  const body: any = await bodyParser.toJSON(request);
  const colors: ColorSet = {
    color1: body.color1 || DEFAULT_COLOR_1,
    color2: body.color2 || DEFAULT_COLOR_2,
    color3: body.color3 || DEFAULT_COLOR_3,
  };
  return colors;
};

const serializeCookieWithColors = async (request: Request, colors: ColorSet) => (
  updateUserPrefs(request, colors)
);

export {
  getColorsFromCookie,
  extractColorsFromRequest,
  serializeCookieWithColors,
};
