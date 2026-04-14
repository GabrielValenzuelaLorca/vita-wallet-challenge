demo_user = User.find_or_create_by!(email: "demo@vitawallet.com") do |user|
  user.password = "password123"
  user.password_confirmation = "password123"
end

empty_user = User.find_or_create_by!(email: "empty@vitawallet.com") do |user|
  user.password = "password123"
  user.password_confirmation = "password123"
end

demo_balances = {
  "USD" => BigDecimal("1000.00"),
  "CLP" => BigDecimal("500000.00"),
  "BTC" => BigDecimal("0.05"),
  "USDC" => BigDecimal("500.00"),
  "USDT" => BigDecimal("500.00")
}

demo_balances.each do |currency, balance|
  Wallet.find_or_create_by!(user: demo_user, currency: currency) do |wallet|
    wallet.balance = balance
  end
end

Wallet::CURRENCIES.each do |currency|
  Wallet.find_or_create_by!(user: empty_user, currency: currency) do |wallet|
    wallet.balance = BigDecimal("0.0")
  end
end

puts "Seeded #{User.count} users with #{Wallet.count / User.count} wallets each"
