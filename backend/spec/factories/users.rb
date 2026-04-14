FactoryBot.define do
  factory :user do
    email { Faker::Internet.unique.email }
    password { "password123" }

    trait :with_wallets do
      after(:create) do |user|
        Wallet::CURRENCIES.each do |currency|
          user.wallets.create!(currency: currency, balance: BigDecimal("100"))
        end
      end
    end
  end
end
