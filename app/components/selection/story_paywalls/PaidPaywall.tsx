import { useFetcher } from '@remix-run/react';
import { withTranslation } from 'react-i18next';
import type { SelectionStory } from '~/helpers/story';

type GamePaywallProps = {
  story: SelectionStory
  t: any
}

function PaidPaywall(props: GamePaywallProps) {
  const {
    story,
    t,
  } = props;
  // console.log('story', story);
  const fetcher = useFetcher();

  const isInCart = fetcher.state === 'idle'
    ? story.inCart
    : fetcher.submission?.formData.get('value') === '1';

  const submitForm = () => {
    const formData = new FormData();
    formData.set('id', story.id);
    formData.set('value', isInCart ? '0' : '1');
    fetcher.submit(
      formData,
      {
        method: 'post',
        action: '/cart',
      },
    );
  };

  return (
    <div
      className="scroller__element__figure__lock__content"
    >
      <div>
        <button
          type="button"
          className="scroller__element__figure__lock__content__cart"
          name="submit"
          value={isInCart ? '0' : '1'}
          aria-label="submit placeholder"
          onClick={submitForm}
        >
          {isInCart ? 'Remove from cart' : 'Add to cart'}
        </button>
      </div>
      <figcaption
        className="scroller__element__figure__lock__content__caption"
      >
        {t('story_paid_locked')}
      </figcaption>
    </div>
  );
}

export default withTranslation('selection')(PaidPaywall);
