FactoryBot.define do
  factory :transaction do
    association :user
    source_currency { "USD" }
    target_currency { "BTC" }
    source_amount { BigDecimal("100") }
    target_amount { BigDecimal("0.00133333") }
    exchange_rate { BigDecimal("0.00001333") }
    status { "completed" }
    kind { "exchange" }
    rejection_reason { nil }

    trait :pending do
      status { "pending" }
    end

    trait :completed do
      status { "completed" }
    end

    trait :rejected do
      status { "rejected" }
      target_amount { BigDecimal("0") }
      exchange_rate { BigDecimal("0") }
      rejection_reason { "insufficient_balance" }
    end

    trait :exchange do
      kind { "exchange" }
    end

    trait :deposit do
      kind { "deposit" }
    end

    trait :recharge do
      kind { "recharge" }
    end

    trait :transfer do
      kind { "transfer" }
    end
  end
end
