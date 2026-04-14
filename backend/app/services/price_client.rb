class PriceClient
  API_URL = "https://api.stage.vitawallet.io/api/prices_quote"

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
    normalize_prices(parsed)
  rescue JSON::ParserError => error
    raise ApiError.new(
      "Invalid JSON from price API: #{error.message}",
      code: :invalid_response
    )
  end

  def normalize_prices(parsed)
    data = parsed.is_a?(Hash) && parsed.key?("data") ? parsed["data"] : parsed

    return data if data.is_a?(Hash)

    raise ApiError.new(
      "Unexpected response structure from price API",
      code: :invalid_response
    )
  end
end
