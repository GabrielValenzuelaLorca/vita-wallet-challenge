FactoryBot.define do
  factory :wallet do
    association :user
    currency { "USD" }
    balance { BigDecimal("1000") }

    trait :usd do
      currency { "USD" }
    end

    trait :clp do
      currency { "CLP" }
    end

    trait :btc do
      currency { "BTC" }
    end

    trait :usdc do
      currency { "USDC" }
    end

    trait :usdt do
      currency { "USDT" }
    end

    trait :zero_balance do
      balance { BigDecimal("0") }
    end
  end
end
