type UserStory = {
  storyId: string
  userId: string
}

type UserCartItem = {
  productId: string
  id: string
}

export type User = {
  games: number
  name: string
  id: string
  stripe_customer: string
  stories?: UserStory[]
  cartItems?: UserCartItem[]
}

type UserSessionUser = {
  id: string
}

export type UserSession = {
  user: UserSessionUser
}
