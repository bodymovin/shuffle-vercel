export type User = {
  games: number
  name: string
  id: string
  stripe_customer: string
}

type UserSessionUser = {
  id: string
}

export type UserSession = {
  user: UserSessionUser
}
