class StubPriceClient
  STUB_PRICES = {
    "BTC" => { "USD" => "67432.50", "CLP" => "62500000.00" },
    "USDC" => { "USD" => "1.00", "CLP" => "925.00" },
    "USDT" => { "USD" => "1.00", "CLP" => "925.00" }
  }.freeze

  def fetch_prices
    STUB_PRICES
  end
end
