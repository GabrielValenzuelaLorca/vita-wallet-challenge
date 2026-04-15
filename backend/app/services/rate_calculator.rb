class RateCalculator
  FIAT_CURRENCIES = %w[USD CLP].freeze

  class << self
    def call(source_currency:, target_currency:, source_amount:, prices:)
      target_amount = calculate_target_amount(
        source_currency: source_currency, target_currency: target_currency,
        source_amount: source_amount, prices: prices
      )
      exchange_rate = target_amount / source_amount

      { target_amount: target_amount, exchange_rate: exchange_rate }
    end

    private

    def calculate_target_amount(source_currency:, target_currency:, source_amount:, prices:)
      source_is_fiat = fiat_currency?(source_currency)
      target_is_fiat = fiat_currency?(target_currency)

      if source_is_fiat && !target_is_fiat
        fiat_to_crypto(source_amount, prices, fiat: source_currency, crypto: target_currency)
      elsif !source_is_fiat && target_is_fiat
        crypto_to_fiat(source_amount, prices, crypto: source_currency, fiat: target_currency)
      elsif source_is_fiat && target_is_fiat
        fiat_to_fiat(source_amount, prices, source: source_currency, target: target_currency)
      else
        crypto_to_crypto(source_amount, prices, source: source_currency, target: target_currency)
      end
    end

    def fiat_to_crypto(source_amount, prices, fiat:, crypto:)
      crypto_per_fiat = fetch_sell_rate(prices, crypto: crypto, fiat: fiat)
      source_amount * crypto_per_fiat
    end

    def crypto_to_fiat(source_amount, prices, crypto:, fiat:)
      crypto_per_fiat = fetch_sell_rate(prices, crypto: crypto, fiat: fiat)
      source_amount / crypto_per_fiat
    end

    def fiat_to_fiat(source_amount, prices, source:, target:)
      source_in_usd =
        if source == "USD"
          source_amount
        else
          usdc_per_source = fetch_sell_rate(prices, crypto: "USDC", fiat: source)
          source_amount * usdc_per_source
        end

      if target == "USD"
        source_in_usd
      else
        usdc_per_target = fetch_sell_rate(prices, crypto: "USDC", fiat: target)
        source_in_usd / usdc_per_target
      end
    end

    def crypto_to_crypto(source_amount, prices, source:, target:)
      crypto_source_per_usd = fetch_sell_rate(prices, crypto: source, fiat: "USD")
      crypto_target_per_usd = fetch_sell_rate(prices, crypto: target, fiat: "USD")
      source_in_usd = source_amount / crypto_source_per_usd
      source_in_usd * crypto_target_per_usd
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
  end
end
