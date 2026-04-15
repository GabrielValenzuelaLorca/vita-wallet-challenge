class PriceService
  CACHE_KEY = "crypto_prices".freeze
  CACHE_TTL = 30.seconds

  # Dedicated memory store so caching works in any Rails environment
  # (development defaults to NullStore, which would bypass Rails.cache and
  # cause us to hammer the external API on every request).
  CACHE_STORE = ActiveSupport::Cache::MemoryStore.new

  class << self
    def fetch_prices(client: nil)
      price_client = client || Rails.application.config.price_client

      CACHE_STORE.fetch(CACHE_KEY, expires_in: CACHE_TTL) do
        price_client.fetch_prices
      end
    end

    # Exposed for tests and manual invalidation.
    def clear_cache!
      CACHE_STORE.delete(CACHE_KEY)
    end
  end
end
