import { withTranslation } from 'react-i18next';

interface SpeedPickerProps {
  t: (a:string) => string
  fetcher: any
}

function SpeedPicker(props: SpeedPickerProps) {
  const {
    t,
    fetcher,
  } = props;

  return (
    <div className="speed">
      <p className="speed__title">{t('menu_site_speed_title')}</p>
      <fetcher.Form method="post" action="/speed" className="speed__form">
        <button
          type="submit"
          className="speed__form__button"
          name="speed"
          value="static"
          aria-label={t('menu_site_speed_no_animation_aria')}
        >
          {t('menu_site_speed_no_animation')}
        </button>
        <button
          type="submit"
          className="speed__form__button"
          name="speed"
          value="slow"
          aria-label={t('menu_site_speed_slow_aria')}
        >
          {t('menu_site_speed_slow')}
        </button>
        <button
          type="submit"
          className="speed__form__button"
          name="speed"
          value="medium"
          aria-label={t('menu_site_speed_medium_aria')}
        >
          {t('menu_site_speed_medium')}
        </button>
        <button
          type="submit"
          className="speed__form__button"
          name="speed"
          value="fast"
          aria-label={t('menu_site_speed_fast_aria')}
        >
          {t('menu_site_speed_fast')}
        </button>
      </fetcher.Form>
    </div>
  );
}
export default withTranslation('index')(SpeedPicker);
