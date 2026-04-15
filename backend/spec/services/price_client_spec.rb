require "rails_helper"

RSpec.describe PriceClient do
  subject(:client) { described_class.new }

  let(:api_url) { PriceClient::API_URL }

  describe "#fetch_prices" do
    context "when API returns valid Vita Wallet format" do
      # Real API format from https://api.stage.vitawallet.io/api/prices_quote:
      #   { "btc" => { "usd_sell" => "0.0000133", ... }, ... }
      # where `btc.usd_sell = 0.0000133` means "1 USD buys 0.0000133 BTC".
      # We preserve this shape as-is (no inversion).
      let(:valid_response) do
        {
          "btc" => {
            "usd_sell" => "0.0000133",
            "usd_buy"  => "0.0000134",
            "clp_sell" => "0.0000000127",
            "clp_buy"  => "0.0000000128",
            "eur_sell" => "0.0000159"
          },
          "usdc" => {
            "usd_sell" => "1.0",
            "usd_buy"  => "1.0",
            "clp_sell" => "0.000944",
            "clp_buy"  => "0.000944"
          },
          "usdt" => {
            "usd_sell" => "1.0",
            "clp_sell" => "0.000944"
          },
          "valid_until" => "2026-04-14T23:00:00Z",
          "days" => 7
        }.to_json
      end

      before do
        stub_request(:get, api_url).to_return(
          status: 200,
          body: valid_response,
          headers: { "Content-Type" => "application/json" }
        )
      end

      it "returns prices keyed by lowercase crypto symbols" do
        result = client.fetch_prices

        expect(result).to be_a(Hash)
        expect(result.keys).to include("btc", "usdc", "usdt")
      end

      it "preserves the sell rate exactly as returned by the API" do
        result = client.fetch_prices
        expect(result["btc"]["usd_sell"]).to eq("0.0000133")
      end

      it "includes both _sell and _buy for each fiat when present" do
        result = client.fetch_prices
        expect(result["btc"].keys).to include("usd_sell", "usd_buy", "clp_sell", "clp_buy")
      end

      it "only includes supported fiats (USD, CLP)" do
        result = client.fetch_prices
        fiat_keys = result["btc"].keys.map { |k| k.split("_").first }.uniq
        expect(fiat_keys).to match_array(%w[usd clp])
      end

      it "filters out non-supported cryptos and extra metadata keys" do
        result = client.fetch_prices
        expect(result.keys).not_to include("valid_until", "days", "fiat", "eur")
      end

      it "includes all three supported cryptos when present" do
        result = client.fetch_prices
        expect(result).to include("btc", "usdc", "usdt")
      end
    end

    context "when API wraps response in a data key" do
      let(:wrapped_response) do
        {
          "data" => {
            "btc" => { "usd_sell" => "0.0000133", "clp_sell" => "0.0000000127" }
          }
        }.to_json
      end

      before do
        stub_request(:get, api_url).to_return(
          status: 200,
          body: wrapped_response,
          headers: { "Content-Type" => "application/json" }
        )
      end

      it "extracts prices from data key" do
        result = client.fetch_prices
        expect(result["btc"]["usd_sell"]).to eq("0.0000133")
      end
    end

    context "when API response is missing a _buy pair" do
      let(:partial_response) do
        { "btc" => { "usd_sell" => "0.0000133" } }.to_json
      end

      before do
        stub_request(:get, api_url).to_return(
          status: 200,
          body: partial_response,
          headers: { "Content-Type" => "application/json" }
        )
      end

      it "includes only the keys actually returned" do
        result = client.fetch_prices
        expect(result["btc"].keys).to eq(["usd_sell"])
      end
    end

    context "when API times out" do
      before do
        stub_request(:get, api_url).to_timeout
      end

      it "raises ApiError with timeout code" do
        expect { client.fetch_prices }.to raise_error(PriceClient::ApiError) do |error|
          expect(error.code).to eq(:timeout)
        end
      end
    end

    context "when API returns 500" do
      before do
        stub_request(:get, api_url).to_return(status: 500, body: "Internal Server Error")
      end

      it "raises ApiError with server_error code" do
        expect { client.fetch_prices }.to raise_error(PriceClient::ApiError) do |error|
          expect(error.code).to eq(:server_error)
          expect(error.message).to include("500")
        end
      end
    end

    context "when API returns invalid JSON" do
      before do
        stub_request(:get, api_url).to_return(
          status: 200,
          body: "not json at all",
          headers: { "Content-Type" => "application/json" }
        )
      end

      it "raises ApiError with invalid_response code" do
        expect { client.fetch_prices }.to raise_error(PriceClient::ApiError) do |error|
          expect(error.code).to eq(:invalid_response)
        end
      end
    end

    context "when API returns unexpected top-level structure" do
      before do
        stub_request(:get, api_url).to_return(
          status: 200,
          body: "[1, 2, 3]",
          headers: { "Content-Type" => "application/json" }
        )
      end

      it "raises ApiError with invalid_response code" do
        expect { client.fetch_prices }.to raise_error(PriceClient::ApiError) do |error|
          expect(error.code).to eq(:invalid_response)
        end
      end
    end

    context "when API returns none of the supported cryptos" do
      before do
        stub_request(:get, api_url).to_return(
          status: 200,
          body: { "doge" => { "usd_sell" => "0.01" } }.to_json,
          headers: { "Content-Type" => "application/json" }
        )
      end

      it "raises ApiError with invalid_response code" do
        expect { client.fetch_prices }.to raise_error(PriceClient::ApiError) do |error|
          expect(error.code).to eq(:invalid_response)
        end
      end
    end

    context "when a SocketError occurs" do
      before do
        stub_request(:get, api_url).to_raise(SocketError.new("getaddrinfo: Name or service not known"))
      end

      it "raises ApiError with connection_error code" do
        expect { client.fetch_prices }.to raise_error(PriceClient::ApiError) do |error|
          expect(error.code).to eq(:connection_error)
          expect(error.message).to include("connection error")
        end
      end
    end

    context "when connection is refused" do
      before do
        stub_request(:get, api_url).to_raise(Errno::ECONNREFUSED.new("Connection refused"))
      end

      it "raises ApiError with connection_error code" do
        expect { client.fetch_prices }.to raise_error(PriceClient::ApiError) do |error|
          expect(error.code).to eq(:connection_error)
        end
      end
    end

    context "when host is unreachable" do
      before do
        stub_request(:get, api_url).to_raise(Errno::EHOSTUNREACH.new("No route to host"))
      end

      it "raises ApiError with connection_error code" do
        expect { client.fetch_prices }.to raise_error(PriceClient::ApiError) do |error|
          expect(error.code).to eq(:connection_error)
        end
      end
    end

    context "when SSL error occurs" do
      before do
        stub_request(:get, api_url).to_raise(OpenSSL::SSL::SSLError.new("SSL_connect returned=1"))
      end

      it "raises ApiError with connection_error code" do
        expect { client.fetch_prices }.to raise_error(PriceClient::ApiError) do |error|
          expect(error.code).to eq(:connection_error)
          expect(error.message).to include("connection error")
        end
      end
    end
  end
end
