type UserStory = {
  storyId: string
  userId: string
}

export type User = {
  games: number
  name: string
  id: string
  stripe_customer: string
  stories?: UserStory[]
}

type UserSessionUser = {
  id: string
}

export type UserSession = {
  user: UserSessionUser
}
