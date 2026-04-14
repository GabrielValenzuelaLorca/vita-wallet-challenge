require "net/http"
require "json"

# Fetches crypto/fiat exchange rates from the Vita Wallet stage API.
#
# Response shape (kept as-is from the API, no inversion):
#   {
#     "btc"  => { "usd_sell" => "0.0000133", "usd_buy" => "0.0000134",
#                 "clp_sell" => "0.0000000127", "clp_buy" => "0.0000000128", ... },
#     "usdc" => { "usd_sell" => "1.0", "clp_sell" => "0.000944", ... },
#     "usdt" => { "usd_sell" => "1.0", "clp_sell" => "0.000944", ... }
#   }
#
# Semantics: `prices[<crypto>]["<fiat>_sell"]` is the amount of `<crypto>`
# you get per 1 unit of `<fiat>` at the sell rate. Inverted for crypto→fiat.
#
# The client filters to only the cryptos/fiats the app actually supports
# and strips any extra keys (valid_until, days, etc.) from the payload.
class PriceClient
  API_URL = "https://api.stage.vitawallet.io/api/prices_quote"

  SUPPORTED_CRYPTOS = %w[btc usdc usdt].freeze
  SUPPORTED_FIATS = %w[usd clp].freeze

  class ApiError < StandardError
    attr_reader :code

    def initialize(message, code:)
      @code = code
      super(message)
    end
  end

  def fetch_prices
    uri = URI(API_URL)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.open_timeout = timeout_seconds
    http.read_timeout = timeout_seconds

    response = http.get(uri.request_uri)

    unless response.is_a?(Net::HTTPSuccess)
      raise ApiError.new(
        "External price API returned #{response.code}",
        code: :server_error
      )
    end

    parse_response(response.body)
  rescue Net::OpenTimeout, Net::ReadTimeout => error
    raise ApiError.new(
      "Price API timeout: #{error.message}",
      code: :timeout
    )
  end

  private

  def timeout_seconds
    ENV.fetch("PRICE_API_TIMEOUT", 5).to_i
  end

  def parse_response(body)
    parsed = JSON.parse(body)
    filter_prices(parsed)
  rescue JSON::ParserError => error
    raise ApiError.new(
      "Invalid JSON from price API: #{error.message}",
      code: :invalid_response
    )
  end

  # Keeps the API structure but filters to only supported cryptos and the
  # _sell/_buy pairs for supported fiats. No numeric transformation.
  def filter_prices(parsed)
    raise_invalid_structure unless parsed.is_a?(Hash)

    source = parsed.key?("data") && parsed["data"].is_a?(Hash) ? parsed["data"] : parsed

    result = {}

    SUPPORTED_CRYPTOS.each do |crypto|
      crypto_data = source[crypto]
      next unless crypto_data.is_a?(Hash)

      filtered = {}
      SUPPORTED_FIATS.each do |fiat|
        %w[sell buy].each do |side|
          key = "#{fiat}_#{side}"
          value = crypto_data[key]
          filtered[key] = value.to_s if value.present?
        end
      end

      result[crypto] = filtered unless filtered.empty?
    end

    raise_invalid_structure if result.empty?

    result
  end

  def raise_invalid_structure
    raise ApiError.new(
      "Unexpected response structure from price API",
      code: :invalid_response
    )
  end
end
