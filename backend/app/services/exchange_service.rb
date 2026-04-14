class ExchangeService
  FIAT_CURRENCIES = %w[USD CLP].freeze

  class << self
    def execute(user:, source_currency:, target_currency:, source_amount:)
      validation_result = validate_input(user: user, source_currency: source_currency,
                                         target_currency: target_currency, source_amount: source_amount)
      return validation_result unless validation_result[:success]

      source_amount_decimal = BigDecimal(source_amount.to_s)

      perform_exchange(user: user, source_currency: source_currency,
                       target_currency: target_currency, source_amount_decimal: source_amount_decimal)
    end

    private

    def validate_input(user:, source_currency:, target_currency:, source_amount:)
      unless Wallet::CURRENCIES.include?(source_currency) && Wallet::CURRENCIES.include?(target_currency)
        return error_result(error_code: "invalid_currencies",
                            error_message: "Source and target currencies must be valid (#{Wallet::CURRENCIES.join(', ')})")
      end

      if source_currency == target_currency
        return error_result(error_code: "invalid_currencies",
                            error_message: "Source and target currencies must differ")
      end

      unless user.wallets.exists?(currency: source_currency) && user.wallets.exists?(currency: target_currency)
        return error_result(error_code: "invalid_currencies",
                            error_message: "User must have wallets for both currencies")
      end

      amount_decimal = BigDecimal(source_amount.to_s)
      unless amount_decimal.positive?
        return error_result(error_code: "invalid_amount",
                            error_message: "Amount must be positive")
      end

      { success: true }
    end

    def perform_exchange(user:, source_currency:, target_currency:, source_amount_decimal:)
      ActiveRecord::Base.transaction do
        source_wallet = user.wallets.lock.find_by!(currency: source_currency)

        unless source_wallet.balance >= source_amount_decimal
          transaction = create_rejected_transaction(
            user: user, source_currency: source_currency, target_currency: target_currency,
            source_amount: source_amount_decimal, rejection_reason: "insufficient_balance"
          )
          return { success: false, transaction: transaction,
                   error_code: "insufficient_balance", error_message: "Insufficient balance in #{source_currency} wallet" }
        end

        prices = PriceService.fetch_prices

        target_amount = calculate_target_amount(
          source_currency: source_currency, target_currency: target_currency,
          source_amount: source_amount_decimal, prices: prices
        )
        exchange_rate = target_amount / source_amount_decimal

        source_wallet.balance -= source_amount_decimal
        source_wallet.save!

        target_wallet = user.wallets.lock.find_by!(currency: target_currency)
        target_wallet.balance += target_amount
        target_wallet.save!

        transaction = Transaction.create!(
          user: user,
          source_currency: source_currency,
          target_currency: target_currency,
          source_amount: source_amount_decimal,
          target_amount: target_amount,
          exchange_rate: exchange_rate,
          status: "completed"
        )

        { success: true, transaction: transaction }
      end
    rescue PriceClient::ApiError
      transaction = create_rejected_transaction(
        user: user, source_currency: source_currency, target_currency: target_currency,
        source_amount: source_amount_decimal, rejection_reason: "price_fetch_failed"
      )
      { success: false, transaction: transaction,
        error_code: "price_fetch_failed", error_message: "Could not fetch exchange rates" }
    end

    def calculate_target_amount(source_currency:, target_currency:, source_amount:, prices:)
      source_is_fiat = fiat_currency?(source_currency)
      target_is_fiat = fiat_currency?(target_currency)

      if source_is_fiat && !target_is_fiat
        price_of_crypto_in_fiat = BigDecimal(prices[target_currency][source_currency])
        source_amount / price_of_crypto_in_fiat
      elsif !source_is_fiat && target_is_fiat
        price_of_crypto_in_fiat = BigDecimal(prices[source_currency][target_currency])
        source_amount * price_of_crypto_in_fiat
      elsif source_is_fiat && target_is_fiat
        source_in_usd = source_currency == "USD" ? source_amount : source_amount / BigDecimal(prices["USDC"][source_currency])
        target_currency == "USD" ? source_in_usd : source_in_usd * BigDecimal(prices["USDC"][target_currency])
      else
        source_in_usd = source_amount * BigDecimal(prices[source_currency]["USD"])
        price_of_target_in_usd = BigDecimal(prices[target_currency]["USD"])
        source_in_usd / price_of_target_in_usd
      end
    end

    def fiat_currency?(currency)
      FIAT_CURRENCIES.include?(currency)
    end

    def create_rejected_transaction(user:, source_currency:, target_currency:, source_amount:, rejection_reason:)
      Transaction.create!(
        user: user,
        source_currency: source_currency,
        target_currency: target_currency,
        source_amount: source_amount,
        target_amount: 0,
        exchange_rate: 0,
        status: "rejected",
        rejection_reason: rejection_reason
      )
    end

    def error_result(error_code:, error_message:)
      { success: false, transaction: nil, error_code: error_code, error_message: error_message }
    end
  end
end
