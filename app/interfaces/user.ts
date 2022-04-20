export type User = {
  games: number
  name: string
  id: string
}

type UserSessionUser = {
  id: string
}

export type UserSession = {
  user: UserSessionUser
}
