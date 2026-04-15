require "rails_helper"

RSpec.describe RateCalculator do
  let(:prices) { StubPriceClient::STUB_PRICES }

  describe ".call" do
    context "fiat to crypto (USD -> BTC)" do
      let(:result) do
        described_class.call(
          source_currency: "USD", target_currency: "BTC",
          source_amount: BigDecimal("100"), prices: prices
        )
      end

      it "returns target_amount and exchange_rate" do
        expect(result).to include(:target_amount, :exchange_rate)
      end

      it "calculates target_amount as source * sell_rate" do
        btc_per_usd = BigDecimal(prices["btc"]["usd_sell"])
        expected = BigDecimal("100") * btc_per_usd
        expect(result[:target_amount]).to eq(expected)
      end

      it "calculates exchange_rate as target_amount / source_amount" do
        expect(result[:exchange_rate]).to eq(result[:target_amount] / BigDecimal("100"))
      end
    end

    context "crypto to fiat (BTC -> USD)" do
      let(:result) do
        described_class.call(
          source_currency: "BTC", target_currency: "USD",
          source_amount: BigDecimal("0.001"), prices: prices
        )
      end

      it "calculates target_amount as source / sell_rate" do
        btc_per_usd = BigDecimal(prices["btc"]["usd_sell"])
        expected = BigDecimal("0.001") / btc_per_usd
        expect(result[:target_amount]).to eq(expected)
      end

      it "returns a positive exchange_rate" do
        expect(result[:exchange_rate]).to be_positive
      end
    end

    context "crypto to crypto (BTC -> USDC) via USD pivot" do
      let(:result) do
        described_class.call(
          source_currency: "BTC", target_currency: "USDC",
          source_amount: BigDecimal("0.001"), prices: prices
        )
      end

      it "pivots through USD correctly" do
        btc_per_usd = BigDecimal(prices["btc"]["usd_sell"])
        usdc_per_usd = BigDecimal(prices["usdc"]["usd_sell"])
        source_in_usd = BigDecimal("0.001") / btc_per_usd
        expected = source_in_usd * usdc_per_usd
        expect(result[:target_amount]).to eq(expected)
      end

      it "returns a positive exchange_rate" do
        expect(result[:exchange_rate]).to be_positive
      end
    end

    context "fiat to fiat (USD -> CLP) via USDC pivot" do
      let(:result) do
        described_class.call(
          source_currency: "USD", target_currency: "CLP",
          source_amount: BigDecimal("10"), prices: prices
        )
      end

      it "pivots through USDC correctly" do
        usdc_per_clp = BigDecimal(prices["usdc"]["clp_sell"])
        expected = BigDecimal("10") / usdc_per_clp
        expect(result[:target_amount]).to eq(expected)
      end

      it "returns a positive exchange_rate" do
        expect(result[:exchange_rate]).to be_positive
      end
    end

    context "fiat to fiat (CLP -> USD) via USDC pivot" do
      let(:result) do
        described_class.call(
          source_currency: "CLP", target_currency: "USD",
          source_amount: BigDecimal("10000"), prices: prices
        )
      end

      it "converts CLP to USD through USDC" do
        usdc_per_clp = BigDecimal(prices["usdc"]["clp_sell"])
        source_in_usd = BigDecimal("10000") * usdc_per_clp
        expect(result[:target_amount]).to eq(source_in_usd)
      end
    end

    context "missing price data" do
      it "raises PriceClient::ApiError for missing crypto" do
        expect {
          described_class.call(
            source_currency: "USD", target_currency: "DOGE",
            source_amount: BigDecimal("10"), prices: prices
          )
        }.to raise_error(PriceClient::ApiError)
      end

      it "raises PriceClient::ApiError for missing fiat sell rate" do
        incomplete_prices = { "btc" => {} }
        expect {
          described_class.call(
            source_currency: "USD", target_currency: "BTC",
            source_amount: BigDecimal("10"), prices: incomplete_prices
          )
        }.to raise_error(PriceClient::ApiError)
      end
    end
  end
end
