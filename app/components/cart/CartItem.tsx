import { useFetcher } from '@remix-run/react';
import type { CartViewItem } from '~/routes/cart-items';
import type { CartItem } from '~/utils/cart.server';

type CartItemProps = {
  cartItem: CartViewItem
}

function CartItemElement(props: CartItemProps) {
  const {
    cartItem,
  } = props;
  const toggle = useFetcher();

  /*
    const isInCart = fetcher.state === 'idle'
    ? story.cart && story.cart.status !== 'deleted'
    // TODO: when the cart item doesn't exist, it's probably better to show a spinner
    : fetcher.submission?.formData.get('status') !== 'deleted';
  */
  const isInCart = toggle.state === 'idle'
    ? cartItem.cart.status !== 'deleted'
    : toggle.submission?.formData.get('status') !== 'deleted';

  const submitForm = () => {
    const cart: CartItem = {
      ...cartItem.cart,
      status: isInCart ? 'deleted' : 'pending',
    };
    toggle.submit(
      cart,
      {
        method: isInCart ? 'delete' : 'put',
        action: '/cart',
      },
    );
  };

  return (
    <li>
      <div>{cartItem.story.title}</div>
      <toggle.Form>
        <button
          type="button"
          className="cart-item__button"
          name="submit"
          value={isInCart ? '0' : '1'}
          aria-label="submit placeholder"
          onClick={submitForm}
        >
          {isInCart ? 'Remove from cart' : 'Add to cart'}
        </button>
      </toggle.Form>
    </li>
  );
}
export default CartItemElement;
