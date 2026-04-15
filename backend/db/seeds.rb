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

sample_transactions = [
  { kind: "recharge", source_currency: "CLP", target_currency: "CLP",
    source_amount: BigDecimal("50000"), target_amount: BigDecimal("50000"),
    exchange_rate: BigDecimal("1") },
  { kind: "deposit", source_currency: "CLP", target_currency: "CLP",
    source_amount: BigDecimal("2000"), target_amount: BigDecimal("2000"),
    exchange_rate: BigDecimal("1") },
  { kind: "transfer", source_currency: "CLP", target_currency: "CLP",
    source_amount: BigDecimal("10000"), target_amount: BigDecimal("10000"),
    exchange_rate: BigDecimal("1") },
  { kind: "transfer", source_currency: "CLP", target_currency: "CLP",
    source_amount: BigDecimal("20000"), target_amount: BigDecimal("20000"),
    exchange_rate: BigDecimal("1") },
  { kind: "exchange", source_currency: "USD", target_currency: "USDT",
    source_amount: BigDecimal("2"), target_amount: BigDecimal("2.00"),
    exchange_rate: BigDecimal("1") }
]

if demo_user.transactions.count < sample_transactions.length
  sample_transactions.each do |attrs|
    demo_user.transactions.create!(attrs.merge(status: "completed"))
  end
end

user_count = User.count
wallets_per_user = user_count.zero? ? 0 : Wallet.count / user_count
puts "Seeded #{user_count} users with #{wallets_per_user} wallets each"
puts "Seeded #{demo_user.transactions.count} transactions for demo user"
