class PriceService
  CACHE_KEY = "crypto_prices"
  CACHE_TTL = 30.seconds

  class << self
    def fetch_prices(client: nil)
      price_client = client || Rails.application.config.price_client

      Rails.cache.fetch(CACHE_KEY, expires_in: CACHE_TTL) do
        price_client.fetch_prices
      end
    rescue PriceClient::ApiError
      raise
    end
  end
end
