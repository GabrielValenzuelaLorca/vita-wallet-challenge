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

    # Calculates the amount of target currency received when exchanging
    # `source_amount` of source currency.
    #
    # Prices follow the Vita Wallet API format:
    #   prices[<crypto>]["<fiat>_sell"] = amount of <crypto> per 1 unit of <fiat>
    #
    # Derivations per direction:
    # - fiat → crypto (e.g. USD → BTC):
    #     target_amount = source_amount * prices["btc"]["usd_sell"]
    #     (multiply fiat by "BTC per 1 USD")
    # - crypto → fiat (e.g. BTC → USD):
    #     target_amount = source_amount / prices["btc"]["usd_sell"]
    #     (divide crypto by "BTC per 1 USD" to get USD)
    # - fiat → fiat (USD ↔ CLP): pivot through USDC (stable 1:1 with USD).
    # - crypto → crypto (e.g. BTC → USDT): pivot through USD.
    def calculate_target_amount(source_currency:, target_currency:, source_amount:, prices:)
      source_is_fiat = fiat_currency?(source_currency)
      target_is_fiat = fiat_currency?(target_currency)

      if source_is_fiat && !target_is_fiat
        crypto_per_fiat = fetch_sell_rate(prices, crypto: target_currency, fiat: source_currency)
        source_amount * crypto_per_fiat
      elsif !source_is_fiat && target_is_fiat
        crypto_per_fiat = fetch_sell_rate(prices, crypto: source_currency, fiat: target_currency)
        source_amount / crypto_per_fiat
      elsif source_is_fiat && target_is_fiat
        source_in_usd =
          if source_currency == "USD"
            source_amount
          else
            usdc_per_source = fetch_sell_rate(prices, crypto: "USDC", fiat: source_currency)
            source_amount * usdc_per_source
          end

        if target_currency == "USD"
          source_in_usd
        else
          usdc_per_target = fetch_sell_rate(prices, crypto: "USDC", fiat: target_currency)
          source_in_usd / usdc_per_target
        end
      else
        # crypto → crypto: pivot through USD.
        crypto_source_per_usd = fetch_sell_rate(prices, crypto: source_currency, fiat: "USD")
        crypto_target_per_usd = fetch_sell_rate(prices, crypto: target_currency, fiat: "USD")
        source_in_usd = source_amount / crypto_source_per_usd
        source_in_usd * crypto_target_per_usd
      end
    end

    def fetch_sell_rate(prices, crypto:, fiat:)
      crypto_data = prices[crypto.downcase] || prices[crypto]
      raise PriceClient::ApiError.new("Missing price for #{crypto}", code: :invalid_response) unless crypto_data

      rate = crypto_data["#{fiat.downcase}_sell"]
      raise PriceClient::ApiError.new("Missing #{fiat} sell rate for #{crypto}", code: :invalid_response) if rate.nil?

      BigDecimal(rate.to_s)
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
