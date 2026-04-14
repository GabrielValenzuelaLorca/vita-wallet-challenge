# Stub that mirrors the shape of the real Vita Wallet prices_quote endpoint.
#
# Same semantics as PriceClient: `prices[<crypto>]["<fiat>_sell"]` is the
# amount of `<crypto>` you get per 1 unit of `<fiat>` at the sell rate.
#
# Values are realistic approximations for local development.
class StubPriceClient
  # Market reference (approximate):
  #   1 BTC  ≈ 75000 USD  ≈ 79_500_000 CLP
  #   1 USDC ≈ 1 USD      ≈ 1060 CLP
  #   1 USDT ≈ 1 USD      ≈ 1060 CLP
  STUB_PRICES = {
    "btc" => {
      "usd_sell" => "0.00001333333333", # 1 / 75000
      "usd_buy"  => "0.00001320132013", # slightly tighter spread
      "clp_sell" => "0.00000001257862",  # 1 / 79_500_000
      "clp_buy"  => "0.00000001245330"
    },
    "usdc" => {
      "usd_sell" => "1.0",
      "usd_buy"  => "1.0",
      "clp_sell" => "0.00094339622641",  # 1 / 1060
      "clp_buy"  => "0.00094339622641"
    },
    "usdt" => {
      "usd_sell" => "1.0",
      "usd_buy"  => "1.0",
      "clp_sell" => "0.00094339622641",
      "clp_buy"  => "0.00094339622641"
    }
  }.freeze

  def fetch_prices
    STUB_PRICES
  end
end
