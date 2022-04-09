import { TFunction, withTranslation } from 'react-i18next';
import { ColorSet } from '~/interfaces/colors';

// eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
function buildCustomPalette(colors:ColorSet, fetcher:any) {
  function handleChange(event: any) {
    fetcher.submit(event.currentTarget);
  }
  return (
    <fetcher.Form method="post" action="/color" onChange={handleChange}>
      <input type="color" name="color1" defaultValue={colors.color1} />
      <input type="color" name="color2" defaultValue={colors.color2} />
      <input type="color" name="color3" defaultValue={colors.color3} />
      <input type="submit" />
    </fetcher.Form>
  );
}

function buildStyle(color: string) {
  return {
    backgroundColor: color,
  };
}

function buildPalette(colors:ColorSet) {
  return (
    <>
      <span className="palette__button__color" style={buildStyle(colors.color1)} />
      <span className="palette__button__color" style={buildStyle(colors.color2)} />
      <span className="palette__button__color" style={buildStyle(colors.color3)} />
    </>
  );
}

function buildPaletteForm(colors:ColorSet, fetcher:any, t:TFunction<'index'>) {
  return (
    <div className="palette">
      <fetcher.Form method="post" action="/color">
        <input type="hidden" name="color1" value={colors.color1} />
        <input type="hidden" name="color2" defaultValue={colors.color2} />
        <input type="hidden" name="color3" defaultValue={colors.color3} />
        <button
          type="submit"
          className="palette__button"
          name="palette"
          value="1"
          aria-label={t('change_palette_aria', { key1: colors.color1, key2: colors.color2, key3: colors.color3 })}
        >
          {buildPalette(colors)}
        </button>
      </fetcher.Form>
    </div>
  );
}

interface PalettePickerProps {
  t: (a: string) => string
  fetcher: any,
}

function PalettePicker(props: PalettePickerProps) {
  const {
    t,
    fetcher,
  } = props;

  return (
    <div>
      <p className="palette__title">{t('choose_palette')}</p>
      {buildPaletteForm({ color1: '#353535', color2: '#FFEBD5', color3: '#F3E7D6' }, fetcher, t)}
      {buildPaletteForm({ color1: '#e1e1e1', color2: '#30233c', color3: '#362b4b' }, fetcher, t)}
      {buildPaletteForm({ color1: '#970e0e', color2: '#b1bcc6', color3: '#181ad0' }, fetcher, t)}
    </div>
  );
}
export default withTranslation('index')(PalettePicker);
