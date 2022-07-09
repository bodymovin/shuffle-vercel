import { useFetcher } from '@remix-run/react';
import { withTranslation } from 'react-i18next';
import type { SelectionStory } from '~/helpers/story';
import type { CartItem } from '~/utils/cart.server';

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
    ? story.cart && story.cart.status !== 'deleted'
    // TODO: when the cart item doesn't exist, it's probably better to show a spinner
    : fetcher.submission?.formData.get('status') !== 'deleted';

  const submitForm = () => {
    const formData = new FormData();
    if (story.cart) {
      const cart: CartItem = {
        ...story.cart,
        status: isInCart ? 'deleted' : 'pending',
      };

      fetcher.submit(
        cart,
        {
          method: isInCart ? 'delete' : 'put',
          action: '/cart',
        },
      );
    } else {
      formData.set('storyId', story.id);
      fetcher.submit(
        formData,
        {
          method: 'post',
          action: '/cart',
        },
      );
    }
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
