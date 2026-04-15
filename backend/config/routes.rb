Rails.application.routes.draw do
  get "health", to: "health#show"

  post "auth/register", to: "auth#register"
  post "auth/login", to: "auth#login"
  get "auth/me", to: "auth#me"
  delete "auth/logout", to: "auth#logout"

  get "balances", to: "wallets#index"
  get "prices", to: "prices#index"
  post "exchange", to: "exchange#create"
  get "transactions", to: "transactions#index"
end
