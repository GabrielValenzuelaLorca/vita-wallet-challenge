# Select which price client to use based on env var or environment.
#
#   PRICE_CLIENT=real  → use PriceClient against the live Vita Wallet API
#   PRICE_CLIENT=stub  → use StubPriceClient with fixed local prices
#   (unset)            → real in production, stub everywhere else
Rails.application.config.after_initialize do
  explicit = ENV["PRICE_CLIENT"]&.downcase
  Rails.application.config.price_client =
    case explicit
    when "real"
      PriceClient.new
    when "stub"
      StubPriceClient.new
    else
      Rails.env.production? ? PriceClient.new : StubPriceClient.new
    end
end
