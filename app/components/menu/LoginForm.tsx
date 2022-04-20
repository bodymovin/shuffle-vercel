import { Link } from '@remix-run/react';
import { User } from '~/interfaces/user';
import { withTranslation } from 'react-i18next';
import { ANONYMOUS_ID } from '~/helpers/constants/user';

interface LoginFormProps {
  t: (a:string) => string
  user: User
}

function LoginForm(props: LoginFormProps) {
  const {
    t,
    user,
  } = props;

  if (user.id === ANONYMOUS_ID) {
    return (
      <Link to="/login" className="login" aria-label={t('menu_login')}>{t('menu_login')}</Link>
    );
  }
  return (
    <form action="/logout" method="post" className="logout">
      <button type="submit" className="logout__button" aria-label={t('menu_logout')}>
        {t('menu_logout')}
      </button>
    </form>
  );
}
export default withTranslation('index')(LoginForm);
