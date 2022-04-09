import { useMatches, Link } from '@remix-run/react';
import { TFunction, withTranslation } from 'react-i18next';
import { Chapters } from '~/helpers/enums/chapters';

interface MainMenuProps{
  isOpen: boolean
  // eslint-disable-next-line no-unused-vars
  t: (a: string) => string
  onToggle: () => void
}

const buildNavLinkClass = (isMenuOpen: Boolean): string => {
  const buttonClasses = [
    'menu__navigation',
  ];

  if (isMenuOpen) {
    buttonClasses.push('menu__navigation--open');
  }

  return buttonClasses.join(' ');
};

const buildNavButton = (matches: any[], isOpen: boolean, t:TFunction<'index'>) => {
  const isStoryPath = !!matches.find((match) => match.pathname === '/story');

  if (isStoryPath) {
    return (
      <Link
        to={`/selection/${Chapters.character}`}
        className={buildNavLinkClass(isOpen)}
        aria-label={t('menu_back_aria')}
      >
        {'<'}
      </Link>
    );
  }
  return null;
};

const buildMenuClass = (isMenuOpen: Boolean): string => {
  const buttonClasses = [
    'menu__toggle',
  ];

  if (isMenuOpen) {
    buttonClasses.push('menu__toggle--open');
  }

  return buttonClasses.join(' ');
};

function buildClipPath() {
  let i = 0;
  const rectWidth = 4;
  const rects = [];
  while (i < 50 / rectWidth) {
    rects.push(
      <rect
        key={i}
        x={i * rectWidth}
        y={-rectWidth / 2}
        width={rectWidth}
        height={50 + rectWidth}
        rx={rectWidth / 2}
        ry={rectWidth / 2}
        className={`clip-rect clip-rect-${i}`}
      />,
    );
    i += 1;
  }
  return rects;
}

function MainMenu(props: MainMenuProps) {
  const {
    t,
    isOpen,
    onToggle,
  } = props;

  const matches = useMatches();

  return (
    <div className="menu__floating-navigation">
      <button
        type="button"
        className={buildMenuClass(isOpen)}
        onClick={onToggle}
        aria-label={t('main_menu')}
      >
        <svg
          width="50"
          height="50"
          viewBox="0 0 50 50"
          style={{ width: '100%', height: '100%' }}
        >
          <defs>
            <symbol id="rect-id">
              <rect
                x={13}
                y={24}
                width={24}
                height={2}
              />
            </symbol>
            <clipPath id="menu-clip">
              {buildClipPath()}
            </clipPath>
          </defs>
          <g className="menu-open">
            <rect
              width={50}
              height={50}
            />
            <use
              xlinkHref="#rect-id"
              transform="translate(0, -5)"
            />
            <use
              xlinkHref="#rect-id"
              transform="translate(0, 0)"
            />
            <use
              xlinkHref="#rect-id"
              transform="translate(0, 5)"
            />
          </g>
          <g clipPath="url(#menu-clip)" className="menu-close">
            <rect
              width={50}
              height={50}
            />
            <use
              xlinkHref="#rect-id"
              transform="translate(25, 25) rotate(45) translate(-25, -25)"
            />
            <use
              xlinkHref="#rect-id"
              transform="translate(25, 25) rotate(-45) translate(-25, -25)"
            />
          </g>
        </svg>
      </button>
      {buildNavButton(matches, isOpen, t)}
    </div>
  );
}
export default withTranslation('index')(MainMenu);
