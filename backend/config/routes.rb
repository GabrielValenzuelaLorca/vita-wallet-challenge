Rails.application.routes.draw do
  get "health", to: "health#show"

  post "auth/register", to: "auth#register"
  post "auth/login", to: "auth#login"
  get "auth/me", to: "auth#me"
end
