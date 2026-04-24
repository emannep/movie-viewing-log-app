
export type AppRoutes =
  | "/"
  | "/auth/login"
  | "/main"
  | "/main/collection"
  | "/main/movies"
  | "/main/movies/[id]"
  | "/main/movies/new"
  | "/main/profile"
  | "/main/recommend_movies"
  | "/main/registration"
  | "/main/settings"

export type LayoutRoutes =
  | "/"
  | "/auth"
  | "/main"

export type AppRouteHandlerRoutes =
  | "/api/tmdb/search"
  | "/auth/callback"

export type ParamMap = {
  "/": Record<string, never>
  "/auth/login": Record<string, never>
  "/auth": Record<string, never>
  "/main": Record<string, never>
  "/main/collection": Record<string, never>
  "/main/movies": Record<string, never>
  "/main/movies/[id]": { id: string }
  "/main/movies/new": Record<string, never>
  "/main/profile": Record<string, never>
  "/main/recommend_movies": Record<string, never>
  "/main/registration": Record<string, never>
  "/main/settings": Record<string, never>
  "/api/tmdb/search": Record<string, never>
  "/auth/callback": Record<string, never>
}