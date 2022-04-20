import { useFetcher, useMatches } from '@remix-run/react';
import { useEffect, useState } from 'react';
import { User } from '~/interfaces/user';
import LoginForm from './LoginForm';
import MainMenu from './MainMenu';
import PalettePicker from './PalettePicker';
import SpeedPicker from './SpeedPicker';

interface MenuInterface {
  user: User
}

const buildSliderClass = (isMenuOpen: Boolean): string => {
  const buttonClasses = [
    'menu__slider',
  ];

  if (isMenuOpen) {
    buttonClasses.push('menu__slider--open');
  }

  return buttonClasses.join(' ');
};

function Menu(props: MenuInterface) {
  const fetcher = useFetcher();
  const { user } = props;
  const [isOpen, open] = useState(false);
  const matches = useMatches();

  useEffect(() => {
    open(false);
  }, [matches]);

  const toggleOpen = () => open(!isOpen);

  return (
    <aside className="menu">
      <MainMenu
        onToggle={toggleOpen}
        isOpen={isOpen}
      />
      <div className={buildSliderClass(isOpen)}>
        <ul>
          <li>
            <PalettePicker
              fetcher={fetcher}
            />
          </li>
          <li>
            <SpeedPicker
              fetcher={fetcher}
            />
          </li>
          <li>
            <LoginForm
              user={user}
            />
          </li>
        </ul>
      </div>
    </aside>
  );
}
export default Menu;
