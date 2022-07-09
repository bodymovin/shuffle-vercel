import { useFetcher } from '@remix-run/react';
import type { ProductViewItem } from '~/routes/cart-items';

type CartItemProps = {
  item: ProductViewItem
}

function ProductItem(props: CartItemProps) {
  const {
    item,
  } = props;
  const toggle = useFetcher();

  const submitForm = () => {
    const formData = new FormData();
    formData.set('storyId', item.story.id);
    toggle.submit(
      formData,
      {
        method: 'post',
        action: '/cart',
      },
    );
  };

  return (
    <li>
      <div>{item.story.title}</div>
      <toggle.Form>
        <input type="hidden" value="1" name="value" />
        <button
          type="button"
          className="cart-item__button"
          name="submit"
          value="1"
          aria-label="submit placeholder"
          onClick={submitForm}
        >
          Add to cart
        </button>
      </toggle.Form>
    </li>
  );
}
export default ProductItem;
