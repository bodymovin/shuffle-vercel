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

  const submitForm = () => {
    toggle.submit(
      cartItem.cart, // TODO: look into this
      {
        method: 'delete',
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
          value="0"
          aria-label="submit placeholder"
          onClick={submitForm}
        >
          Remove from cart
        </button>
      </toggle.Form>
    </li>
  );
}
export default CartItemElement;
