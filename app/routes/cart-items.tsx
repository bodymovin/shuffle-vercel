import type { Story } from '@prisma/client';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import CartItemComponent from '~/components/cart/CartItem';
import { ANONYMOUS_ID } from '~/helpers/constants/user';
import type { CartItem } from '~/utils/cart.server';
import { getCartByUser } from '~/utils/cart.server';
import type { ProductItem } from '~/utils/product.server';
import { getAllProducts, getProductById } from '~/utils/product.server';
import { findStory } from '~/utils/stories.server';
import { getUser } from '~/utils/user.server';
import styles from '~/styles/cart-items.css';
import type { User } from '~/interfaces/user';
import ProductItemComponent from '~/components/cart/ProductItem';
import notEmpty from '~/helpers/notEmpty';

export function links() {
  return [
    {
      rel: 'stylesheet',
      href: styles,
    },
  ];
}

export type CartViewItem = {
  story: Story
  cart: CartItem
  product: ProductItem
}
export type ProductViewItem = {
  story: Story
  product: ProductItem
  cart?: CartItem
}
type UserLoaderData = {
  cartItems: CartViewItem[]
  products: ProductViewItem[]
}

const getUserCartItems = async (user:User): Promise<CartViewItem[]> => {
  let cartItems: CartViewItem[] = [];
  if (user.id !== ANONYMOUS_ID) {
    const cart = await getCartByUser(user.id, ['pending', 'deleted']);
    const nullableCartItems = await Promise.all(cart.map(async (cartItem) => {
      const product = await getProductById(cartItem.productId);
      const story = product ? await findStory(product.itemId) : null;
      if (story && product) {
        return {
          story,
          cart: cartItem,
          product,
        };
      }
      return null;
    }));
    cartItems = nullableCartItems
      .filter(notEmpty)
      .filter((cartViewItem) => cartViewItem.cart.status === 'pending');
  }
  return cartItems;
};

const filterAvailableProducts = async (
  cartItems: CartViewItem[],
  products: ProductItem[],
): Promise<ProductViewItem[]> => {
  const availableProducts = products.filter((
    product,
  ) => !cartItems.find((cartViewItem) => cartViewItem.product.id === product.id));
  const productViewItems = await Promise.all(availableProducts.map(async (product) => {
    const story = await findStory(product.itemId);
    if (!story) {
      return null;
    }
    return {
      story,
      product,
      cart: cartItems.find((cartViewItem) => cartViewItem.product.id === product.id)?.cart,
    };
  }));
  return productViewItems.filter(notEmpty);
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  const [cartItems, products] = await Promise.all([
    getUserCartItems(user),
    getAllProducts(),
  ]);
  const filteredProducts = await filterAvailableProducts(cartItems, products);
  return json({
    cartItems,
    products: filteredProducts,
  });
};

function CartItems() {
  const { cartItems, products } = useLoaderData<UserLoaderData>();
  return (
    <div className="wrapper">
      <ul className="items">
        {cartItems.map((cartItem) => (
          <CartItemComponent
            cartItem={cartItem}
            key={cartItem.cart.id}
          />
        ))}
      </ul>
      <ul>
        {products.map((productItem) => (
          <ProductItemComponent
            item={productItem}
            key={productItem.product.id}
          />
        ))}
      </ul>
    </div>
  );
}
export default CartItems;
